const request = require("request")
, FeedParser = require("feedparser")
, toMarkdown = require("to-markdown");

class RSS
{
    constructor(guild, config)
    {
        this.guild = guild;
        this.config = config;

        this.started = new Date();
        this.meta = null;
        this.interval = null;
        this.update = null;

        this.fetchMeta()
        .then(metadata => {
            this.meta = metadata;

            this.initiateInterval();
        }).catch(this.destroy);
    }

    destroy(err = null)
    {
        if (err) console.error(err);

        delete this.guild.rss;
        return clearInterval(this.interval);
    }

    // fetchMeta() fetches initial metadata for 'this' feed,
    // where checkUpdate() will not be called until this is done
    fetchMeta()
    {
        let feedURL = this.config.url;
        return new Promise(function(resolve, reject)
        {
            request(feedURL)
                .pipe(new FeedParser())
                .on("error", function(error) {
                    reject(error);
                })
                .on("readable", function()
                {
                    resolve(this.meta);
                });
        });
    }

    initiateInterval()
    {
        this.interval = dClient.setInterval(() => {
            // this.updateConfig()
            // .then(() => {
                this.checkUpdate()
                .then(update => {
                    this.processUpdate(update);
                }).catch(console.error);
            // }).catch(console.error);
        }, this.config.interval);
    }

    // invalid code
    updateConfig()
    {
        return new Promise((resolve, reject) => {
            fs.readJson(join(__data, "guilds", this.guild.id, "config.json"), (err, config) => {
                if (err) return reject(err);

                let x = 0;
                loop1:
                for (let thisSetting in this.config)
                {
                    for (let localSetting in config.guild.RSS)
                    {
                        if (thisSetting === localSetting)
                        {
                            x++;
                            if (this.config[thisSetting] !== config.guild.RSS[localSetting]) break loop1;
                            else if (x === Object.keys(this.config).length) return resolve();
                        }
                    }
                }

                if (!config.guild.RSS.enabled)
                {
                    this.destroy(`RSS was disabled by ${this.guild.name}`);
                    return reject();
                }

                if (this.config.channel !== config.guild.RSS.channel) this.config.channel = config.guild.RSS.channel;

                if (this.config.url !== config.guild.RSS.url && this.config.interval !== config.guild.RSS.interval)
                {
                    this.config.url = config.guild.RSS.url;
                    this.config.interval = config.guild.RSS.interval;

                    clearInterval(this.interval);
                    fetchMeta()
                    .then(metadata => {
                        reject(this.initiateInterval());
                    }).catch(console.error);
                } else

                if (this.config.url !== config.guild.RSS.url)
                {
                    this.config.url = config.guild.RSS.url;

                    fetchMeta()
                    .then(metadata => {
                        this.config.meta = metadata;
                        
                        resolve();
                    }).catch(console.error);
                } else

                if (this.config.interval !== config.guild.RSS.interval)
                {
                    this.config.interval = config.guild.RSS.interval;

                    clearInterval(this.interval);
                    resolve(this.initiateInterval());
                }
            });
        });
    }

    checkUpdate()
    {
        return new Promise((resolve, reject) => {
            request(this.config.url)
                .pipe(new FeedParser())
                .on("error", function(error) {
                    reject(this.destroy(error));
                })
                .on("readable", function()
                {
                    let stream = this, item;
                    while (item = stream.read())
                    {
                        return resolve(item);
                    }
                });
        });
    }

    extraProcessUpdate(item)
    {
        item.markdown = toMarkdown(item.description);

        item.image = "";
        if (/(!\[.*?\]\((.+?\.(?:jpg|png|bmp|gif))\))/g.test(item.markdown))
        {
            let matchingImages = /(!\[.*?\]\((.+?\.(?:jpg|png|bmp|gif))\))/g.exec(item.markdown);
            item.image = matchingImages[2];

            for (let i = 1; i < matchingImages.length; i+=2) {
                item.markdown = item.markdown.replace(matchingImages[i], "");
            }
        }

        item.markdown = item.markdown.replace(/\<.*?\>/g, "");
        item.markdown = item.markdown.replace(/\[.*?\]\(.*?\) blogged on \[b2evolution\]\(https?:\/\/b2evolution\.net\/?\)\.?/g, "");
        item.markdown = item.markdown.replace(/\n\n\n/g, "\n\n");

        console.log(item.markdown);
        console.log(item.image);

        return item;
    }

    processUpdate(item)
    {
        fs.readJson(join(__data, "guilds", this.guild.id, "RSS", "savedVariables.json"), (err, savedVars) => {
            if (err) return console.error(err);

            if (Date.parse(item.pubDate) > savedVars.latest)
            {
                this.update = this.extraProcessUpdate(item);

                this.send(this.config.channel).catch(console.error);
                this.save();
            }
        });
    }

    curatePost(item)
    {
        return new Discord.RichEmbed(constants.discord.embed)
            .setAuthor(this.meta.title, "", this.meta.link)
            .setTitle(item.title)
            .setURL(item.link)
            .setDescription(item.markdown)
            .setImage(item.image)
            .setTimestamp(new Date(item.pubDate));
    }

    send(channel)
    {
        return this.guild.channels.get(this.config.channel).send(`${(this.config.roles.length) ? (this.config.roles.map(x => this.guild.roles.get(x).toString() + " ").join(" ")) : ""}`, { embed: this.curatePost(this.update) });
    }

    save()
    {
        fs.outputJson(join(__data, "guilds", this.guild.id, "RSS", "savedVariables.json"), { latest: Date.parse(this.update.pubDate) }, (err) => { if (err) console.error(err) });
    }
}

module.exports = RSS;
