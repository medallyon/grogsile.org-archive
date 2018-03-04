const request = require("request")
, FeedParser = require("feedparser")
, toMarkdown = require("to-markdown")
, Discord = require("discord.js");

const ESO_RSS_URL = "http://files.elderscrollsonline.com/rss/en-gb/eso-rss.xml"
, ESO_NEWS_URL = "http://elderscrollsonline.com/en-us/news"
, ESO_NEWS_ICON = "http://i.imgur.com/qqvt2UX.png";

function update()
{
    return new Promise(function(resolve, reject)
    {
        request(ESO_RSS_URL)
            .pipe(new FeedParser())
            .on("error", function(error)
            {
                reject(error);
            })
            .on("readable", function()
            {
                let stream = this;
                return resolve(stream.read());
            });
    });
}

function checkUpdate(item)
{
    return new Promise(function(resolve, reject)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            let latestSaved = savedVars[0];
            if (Date.parse(item.pubDate) <= latestSaved.pubDate) return reject("modules.esoNews: Nothing new");

            let news = {
                title: item.title || "ESO_TITLE_HEADER",
                description: item.summary || item.description || "ESO_DESC_SUMMARY",
                pubDate: Date.parse(item.pubDate) || 0,
                link: item.link || "#",
                image: ""
            };

            savedVars.unshift(news);
            if (savedVars.length > 5) savedVars.pop();

            dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), savedVars, { spaces: 2 }).then(function()
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
    return new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
        .setAuthor("ESO News", ESO_NEWS_ICON, ESO_NEWS_URL)
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.markdown || item.description)
        .setImage(item.image)
        .setFooter(`${dClient.constants.discord.embed.footer.text} | ${dClient.modules.utils.fancyESODate(new Date(item.pubDate))}`, dClient.constants.discord.embed.footer.icon_url);
}

function distribute(embed)
{
    for (let guild of dClient.guilds.values())
    {
        if (guild.config.eso.news.enabled)
        {
            let newsChannel = dClient.channels.get(guild.config.eso.news.channel);

            dClient.modules.utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).then(function(roles)
            {
                newsChannel.send((guild.config.eso.news.roles.length) ? roles.map(r => r.toString()).join(" ") : "", { embed }).then(function(newsMessage)
                {
                    dClient.modules.utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).catch(console.error);
                    dClient.libs.fs.outputJson(dClient.libs.join(__data, "guilds", guild.id, "esoNews", "savedVariables.json"), { latest: newsMessage.id }, { spaces: 2 }).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
        }
    }
}

function addImageToLatest(image)
{
    dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
    {
        savedVars[0].image = image;
        let embed = prepareEmbed(savedVars[0]);

        for (let guild of dClient.guilds.values())
        {
            if (guild.config.eso.news.enabled)
            {
                let newsChannel = dClient.channels.get(guild.config.eso.news.channel);

                dClient.libs.fs.readJson(dClient.libs.join(__data, "guilds", guild.id, "esoNews", "savedVariables.json")).then(function(guildSavedVars)
                {
                    newsChannel.messages.fetch(guildSavedVars.latest).then(function(message)
                    {
                        message.edit((guild.config.eso.news.roles.length) ? ("<@&" + guild.config.eso.news.roles.join("> <@&") + ">") : "", { embed }).catch(console.error);
                    }).catch(console.error);
                }).catch(console.error);
            }
        }
    }).catch(console.error);
}

function collectESOImage(item)
{
    dClient.channels.get("345610226562629632").send(`<@${dClient.config.bot.discord.ownerId}> The latest ESO News Update has been dispatched. Type \`url\` to set the latest image.\nHere is the link to the post: ${item.link}`).then(function(sentMessage)
    {
        const imageCollector = sentMessage.channel.createMessageCollector(
            m => m.author.id !== dClient.user.id &&
                /https?:\/\/.+?\.jpg|png|bmp|gif/g.test(m.content),
            { maxProcessed: 1 });

        imageCollector.on("end", function(messages)
        {
            let imageURL = messages.first().content;

            addImageToLatest(imageURL);
            dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
            {
                savedVars[0].image = imageURL;
                dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), savedVars).catch(console.error);
            }).catch(console.error);
        });
    }).catch(console.error);
}

function esoNews(msg = null)
{
    if (!msg)
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

    else
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            if (savedVars.length > 1)
            {
                let selectorEmbed = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
                    .setAuthor("ESO News", ESO_NEWS_ICON, ESO_NEWS_URL)
                    .setDescription("Here are the most recent ESO News Articles.");
                selectorEmbed.fieldValueLength = 120;

                dClient.modules.utils.createSelectorEmbed(msg, savedVars.map(x => { return { name: x.title, value: `[Read this article online](${x.link}) | ${dClient.modules.utils.fancyESODate(new Date(x.pubDate))}` } }), selectorEmbed).then(function([selectedNumber, collectorMessage])
                {
                    collectorMessage.edit({ embed: prepareEmbed(savedVars[selectedNumber - 1]) }).catch(console.error);
                }).catch(console.error);
            } else msg.channel.send({ embed: prepareEmbed(savedVars[0]) }).catch(console.error);
        }).catch(console.error);
    }
}

module.exports = esoNews;
