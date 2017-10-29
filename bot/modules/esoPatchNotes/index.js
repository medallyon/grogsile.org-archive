const request = require("request")
, FeedParser = require("feedparser")
, cheerio = require("cheerio");

const rssURL = "https://forums.elderscrollsonline.com/en/categories/patch-notes/feed.rss";

function checkRSS()
{
    return new Promise(function(resolve, reject)
    {
        request(rssURL)
        .pipe(new FeedParser())
        .on("error", reject)
        .on("readable", function()
        {
            let stream = this, item;
            while (item = stream.read()) return resolve(item);
        });
    });
}

function compareUpdates(update)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            if (Date.parse(update.pubDate) > savedVars.timestamp) resolve(update);
            else reject("modules.esoPatchNotes: No new item found");
        }).catch(console.error);
    });
}

function createRichEmbed(data)
{
    return new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor(data.meta.description, dClient.user.displayAvatarURL, data.link)
        .setTitle(data.title)
        .setURL(data.link)
        .setDescription(data.description)
        .setImage(data.image)
        .setTimestamp(new Date(data.pubDate));
}

function distribute(embed)
{
    for (let guild of dClient.guilds.values())
    {
        if (guild.config.guild.patchNotes.enabled) guild.channels.get(guild.config.guild.patchNotes.channel).send({ embed: embed }).catch(console.error);
    }
}

function esoPatchNotes()
{
    checkRSS()
    .then(update => {
        compareUpdates(update)
        .then(update => {
            fs.outputJson(join(__dirname, "savedVars.json"), { timestamp: Date.parse(update.pubDate) }).catch(console.error);
            request(update.link, (err, res, body) => {
                if (err) return console.error(err);

                let $ = cheerio.load(body);

                update.description = $(` meta[name="description"] `).prop("content") || "";
                update.image = $(` meta[name="twitter:image"] `).prop("content") || "";

                distribute(createRichEmbed(update));
            });
        }).catch(console.error);
    }).catch(console.error);
}

module.exports = esoPatchNotes;
