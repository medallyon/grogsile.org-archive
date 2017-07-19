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
              while (item = stream.read())
              {
                  return resolve(item);
              }
          });
    });
}

function compareUpdates(update)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__dirname, "savedVars.json"), (err, savedVars) => {
            if (err) return reject(err);

            if (Date.parse(update.pubDate) > savedVars.timestamp) resolve(update);
            else reject("modules.esoPatchNotes: No new item found");
        });
    });
}

function createRichEmbed(data)
{
    return new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor(data.meta.description, dClient.user.displayAvatarURL, data.link)
        .setTitle(data.title)
        .setURL(data.link)
        .setDescription(data.description)
        .setImage(data.image);
}

function distribute(embed)
{
    console.log(5);
    for (let guild of dClient.guilds.values())
    {
        console.log(6);
        utils.readGuildConfig(guild)
        .then(config => {
            console.log(7);
            if (config.guild.patchNotes.enabled)
            {
                console.log(8);
                guild.channels.get(config.guild.patchNotes.channel).send({ embed: embed }).catch(console.error);
            }
        }).catch(console.error);
    }
}

function esoPatchNotes()
{
    console.log(1);
    checkRSS()
    .then(update => {
        console.log(2);
        compareUpdates(update)
        .then(update => {
            console.log(3);
            fs.outputJson(join(__dirname, "savedVars.json"), { timestamp: Date.parse(update.pubDate) }, (err) => { if (err) console.error(err) });
            request(update.link, (err, res, body) => {
                if (err) return console.error(err);
                console.log(4);

                let $ = cheerio.load(body);

                update.description = $(` meta[name="description"] `).prop("content") || "";
                update.image = $(` meta[name="twitter:image"] `).prop("content") || "";

                distribute(createRichEmbed(update));
            });
        }).catch(console.error);
    }).catch(console.error);
}

module.exports = esoPatchNotes;
