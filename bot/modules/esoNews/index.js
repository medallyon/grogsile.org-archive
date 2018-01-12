const request = require("request")
, FeedParser = require("feedparser")
, toMarkdown = require("to-markdown");

const ESO_RSS_URL = "http://files.elderscrollsonline.com/rss/en-gb/eso-rss.xml";

function update()
{
    return new Promise((resolve, reject) => {
        request(ESO_RSS_URL)
            .pipe(new FeedParser())
            .on("error", function(error) {
                reject(error);
            })
            .on("readable", function()
            {
                let stream = this, item;
                while (item = stream.read()) return resolve(item);
            });
    });
}

function checkUpdate(item)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            if (Date.parse(item.pubDate) <= savedVars.pubDate) return reject("modules.esoNews: Nothing new");

            let news = {
                title: item.title || "ESO_TITLE_HEADER",
                description: item.summary || item.description || "ESO_DESC_SUMMARY",
                pubDate: Date.parse(item.pubDate) || 0,
                link: item.link || "#"
            };

            fs.outputJson(join(__dirname, "savedVars.json"), news, { spaces: 2 }).then(function()
            {
                resolve(news);
            }).catch(reject);
        }).catch(reject);
    });
}

function curateUpdate(item)
{
    item.markdown = toMarkdown(item.description);

    item.image = item.image || "";
    if (/(!\[.*?\]\((.+?\.(?:jpg|png|bmp|gif))\))/g.test(item.markdown))
    {
        for (let i = 1; i < matchingImages.length; i+=2) {
            item.markdown = item.markdown.replace(matchingImages[i], "");
        }
    }

    item.markdown = item.markdown.replace(/\<.*?\>/g, "");
    item.markdown = item.markdown.replace(/\n\n\n/g, "\n\n");

    return item;
}

function prepareEmbed(item)
{
    item = curateUpdate(item);
    return new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor("ESO News", "http://i.imgur.com/qqvt2UX.png", "http://elderscrollsonline.com/en-us/news")
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.markdown)
        .setImage(item.image)
        .setFooter(`${constants.discord.embed.footer.text} | ${utils.fancyESODate(new Date(item.pubDate))}`, constants.discord.embed.footer.icon_url);
}

function distribute(embed)
{
    for (let guild of dClient.guilds.values())
    {
        if (guild.config.eso.news.enabled)
        {
            let newsChannel = dClient.channels.get(guild.config.eso.news.channel);

            utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).then(function(roles)
            {
                newsChannel.send(roles.map(r => r.toString()).join(" "), { embed }).then(function(newsMessage)
                {
                    utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).catch(console.error);
                    fs.outputJson(join(__data, "guilds", guild.id, "esoNews", "savedVariables.json"), { latest: newsMessage.id }, { spaces: 2 }).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
        }
    }
}

function esoNews()
{
    update().then(function(item)
    {
        checkUpdate(item).then(function(news)
        {
            distribute(prepareEmbed(news));
            collectESOImage(news);
        }).catch(console.info);
    }).catch(console.error);
}

function addImageToLatest(image)
{
    fs.readJson(join(__dirname, "savedVars.json")).then(function(item)
    {
        item.image = image;
        embed = prepareEmbed(item);

        for (let guild of dClient.guilds.values())
        {
            if (guild.config.eso.news.enabled)
            {
                let newsChannel = dClient.channels.get(guild.config.eso.news.channel);

                fs.readJson(join(__data, "guilds", guild.id, "esoNews", "savedVariables.json")).then(function(savedVars)
                {
                    newsChannel.messages.fetch(savedVars.latest).then(function(message)
                    {
                        message.edit({ embed }).catch(console.error);
                    }).catch(console.error);
                }).catch(console.error);
            }
        }
    }).catch(console.error);
}

function collectESOImage(item)
{
    dClient.channels.get("345610226562629632").send(`<@${dClient.config.discord.ownerId}> The latest ESO News Update has been dispatched. Type \`url\` to set the latest image.\nHere is the link to the post: ${item.link}`).then(function(sentMessage)
    {
        const imageCollector = sentMessage.channel.createMessageCollector(
            m => m.author.id !== dClient.user.id &&
                /https?:\/\/.+?\.jpg|png|bmp|gif/g.test(m.content),
            { maxProcessed: 1 });

        imageCollector.on("end", function(messages)
        {
            addImageToLatest(messages.first().content);
        });
    }).catch(console.error);
}

module.exports = esoNews;
