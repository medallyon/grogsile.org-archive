const request = require("request")
, FeedParser = require("feedparser")
, cheerio = require("cheerio")
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

function saveUpdate(item, src)
{
    return new Promise(function(resolve, reject)
    {
        src.unshift(item);
        if (src.length > 5) src.pop();

        dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), src, { spaces: 2 }).then(resolve).catch(reject);
    });
}

function checkUpdate(item)
{
    return new Promise(function(resolve, reject)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            let latestSaved = savedVars[0];
            if (Date.parse(item.pubDate) <= latestSaved.pubDate)
                return reject("modules.esoNews: Nothing new");

            let news = {
                title: item.title || "ESO_TITLE_HEADER",
                description: item.summary || item.description || "ESO_DESC_SUMMARY",
                pubDate: Date.parse(item.pubDate) || Date.now(),
                link: item.link || "#",
                image: ""
            };

            fetchArticleImage(news)
                .then(function(imgURL)
                {
                    news.image = imgURL;
                    saveUpdate(news, savedVars).then(function()
                    {
                        resolve(news);
                    }).catch(reject);
                }).catch(function(err)
                {
                    console.error(err);
                    saveUpdate(news, savedVars).then(function()
                    {
                        resolve(news);
                    }).catch(reject);
                });
        }).catch(reject);
    });
}

function fetchArticleImage(item)
{
    return new Promise(function(resolve, reject)
    {
        let url = item.link;
        if (!url)
            return reject(new Error("Item does not contain a link"));

        let esoSession = new dClient.modules.structs.WebsiteSession(url);
        esoSession.init()
            .then(function()
            {
                let $ = cheerio.load(esoSession.body);

                let $imgSelector = $(" #post-body ").find(" img ").first();
                resolve($imgSelector.prop("src"));

                esoSession.destroy();
            }).catch(reject);
    });
}

function curateUpdate(item)
{
    item.image = item.image || "";

    item.markdown = toMarkdown(item.description);
    item.markdown = item.markdown.replace(/\<.*?\>/g, "");
    item.markdown = item.markdown.replace(/\n\n\n/g, "\n\n");

    return item;
}

function prepareEmbed(item)
{
    item = curateUpdate(item);
    return new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor("ESO News", ESO_NEWS_ICON, ESO_NEWS_URL)
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.markdown || item.description)
        .setImage(item.image)
        .setFooter(`${dClient.constants.discord.embed.footer.text} | ${dClient.modules.utils.fancyESODate(new Date(item.pubDate))}`, dClient.constants.discord.embed.footer.icon_url);
}

function distribute(embed)
{
    for (const guild of dClient.guilds.values())
    {
        if (guild.config.eso.news.enabled)
        {
            let newsChannel = dClient.channels.get(guild.config.eso.news.channel);
            if (!newsChannel)
                continue;

            dClient.modules.utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).then(function(roles)
            {
                newsChannel.send((guild.config.eso.news.roles.length) ? roles.map(r => r.toString()).join(" ") : "", { embed }).then(function(newsMessage)
                {
                    dClient.modules.utils.toggleRoles(guild.config.eso.news.toggleRoles, guild.roles.filter(r => guild.config.eso.news.roles.includes(r.id))).catch(dClient.modules.utils.consoleError);
                    dClient.libs.fs.outputJson(dClient.libs.join(__data, "guilds", guild.id, "esoNews", "savedVariables.json"), { latest: newsMessage.id }, { spaces: 2 }).catch(dClient.modules.utils.consoleError);
                }).catch(dClient.modules.utils.consoleError);
            }).catch(dClient.modules.utils.consoleError);
        }
    }
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
            }).catch(console.info);
        }).catch(dClient.modules.utils.consoleError);
    }

    else
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            if (savedVars.length > 1)
            {
                let selectorEmbed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                    .setAuthor("ESO News", ESO_NEWS_ICON, ESO_NEWS_URL)
                    .setDescription("Here are the most recent ESO News Articles.");
                selectorEmbed.fieldValueLength = 120;

                dClient.modules.utils.createSelectorEmbed(msg, savedVars.map(x => ({
                        name: x.title,
                        value: `[Read this article online](${x.link}) | ${dClient.modules.utils.fancyESODate(new Date(x.pubDate))}`
                    })), selectorEmbed)
                .then(function([selectedNumber, collectorMessage])
                {
                    collectorMessage.edit({ embed: prepareEmbed(savedVars[selectedNumber - 1]) }).catch(dClient.modules.utils.consoleError);
                }).catch(dClient.modules.utils.consoleError);
            } else msg.channel.send({ embed: prepareEmbed(savedVars[0]) }).catch(dClient.modules.utils.consoleError);
        }).catch(dClient.modules.utils.consoleError);
    }
}

module.exports = function(msg = null)
{
    esoNews(msg);
};

module.exports.about = {
    name: "esoNews",
    description: "Displays the latest ESO news."
}
module.exports.alias = [
   "esonews",
   "news"
];
module.exports.args = {};
module.exports.userPermissions = 100;
module.exports.example = "";
module.exports.function = esoNews;
