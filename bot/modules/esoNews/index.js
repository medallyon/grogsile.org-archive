const cheerio = require("cheerio");

const newsPage = "http://www.elderscrollsonline.com/en-us/news";

function scrapeSite(request)
{
    return new Promise(function(resolve, reject)
    {
        let newsData = {};
        request(newsPage, (err, res, body) => {
            if (err) return reject(err);

            let $ = cheerio.load(body);

            fs.readJson(join(__dirname, "savedVars.json"), (err, savedVars) => {
                if (err) return reject(err);

                newsData.text = $(" article ").first().text();
                if (newsData.text === savedVars.text) return reject("modules.esoNews: No new articles present");

                newsData.link = $(" article > a ").prop("href");

                request(newsData.link, (err, res, newsPage) => {
                    if (err) return reject(err);

                    $ = cheerio.load(newsPage);

                    newsData.title = $(" h2.mega ").text();
                    newsData.pubDate = new Date($(" time ").text());
                    newsData.description = $(" article#post ").find("i").first().text();
                    newsData.image = $(" article#post ").find("img").first().prop("src");

                    resolve(newsData);
                });
            });
        });
    });
}

function checkUpdate()
{
    return new Promise(function(resolve, reject)
    {
        let myESOSession = new utils.ESOWebsiteSession();

        myESOSession.init()
        .then(request => {
            scrapeSite(request).then(resolve).catch(reject);
        }).catch(reject);
    });
}

function createEmbed(data)
{
    return new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor("ESO News", dClient.user.displayAvatarURL, newsPage)
        .setTitle(data.title)
        .setDescription(data.description)
        .setImage(data.image || "")
        .setFooter(`Brought to you by © Grogsile Inc. | ${utils.fancyESODate(new Date(data.pubDate))}`, "https://i.grogsile.me/favicon.png")
        .setURL(data.link);
}

function distribute(embed)
{
    for (let guild of dClient.guilds.values())
    {
        utils.readGuildConfig(guild)
        .then(config => {
            if (config.eso.news.active)
            {
                guild.channels.get(config.eso.news.channel).send({ embed: embed }).catch(console.error);
            }
        });
    }
}

function esoNews()
{
    checkUpdate()
    .then(update => {
        fs.outputJson(join(__dirname, "savedVars.json"), { text: update.text }, (err) => { if (err) console.error(err); });
        distribute(createEmbed(update));
    }).catch(console.error);
}

module.exports = esoNews;
