const request = require("request")
, FeedParser = require("feedparser")
, cheerio = require("cheerio")
, Discord = require("discord.js");

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
                let stream = this;
                return resolve(stream.read());
            });
    });
}

function compareUpdates(update)
{
    return new Promise(function(resolve, reject)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            if (Date.parse(update.pubDate) > savedVars.timestamp) resolve(update);
            else reject("modules.esoPatchNotes: No new item found");
        }).catch(console.error);
    });
}

function createRichEmbed(data)
{
    return new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
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
        if (guild.config.eso.patchNotes.enabled)
        {
            let channel = guild.channels.get(guild.config.eso.patchNotes.channel);
            if (!channel) continue;

            dClient.modules.utils.toggleRoles(guild.config.eso.patchNotes.toggleRoles, guild.config.eso.patchNotes.roles.map(x => guild.roles.get(x))).then(function(roles)
            {
                channel.send(roles.map(r => r.toString()).join(" "), { embed }).then(function()
                {
                    dClient.modules.utils.toggleRoles(guild.config.eso.patchNotes.toggleRoles, guild.config.eso.patchNotes.roles.map(x => guild.roles.get(x))).catch(console.error);
                }).catch(console.error);
            }).catch(console.error);
        }
    }
}

function esoPatchNotes()
{
    checkRSS()
        .then(function(update)
        {
            compareUpdates(update)
                .then(function(update)
                {
                    dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), { timestamp: Date.parse(update.pubDate) }).catch(console.error);
                    request(update.link, function(err, res, body)
                    {
                        if (err) return console.error(err);

                        let $ = cheerio.load(body);

                        update.description = $(` meta[name="description"] `).prop("content") || "";
                        update.image = $(` meta[name="twitter:image"] `).prop("content") || "";

                        distribute(createRichEmbed(update));
                    });
                }).catch(console.info);
        }).catch(console.error);
}

module.exports = esoPatchNotes;
