const cheerio = require("cheerio");

const ESO_DOMAIN = "http://www.elderscrollsonline.com/"
, NEWS_PAGE = "http://www.elderscrollsonline.com/en-us/news/";

function scrapeSite(request)
{
    return new Promise(function(resolve, reject)
    {
        let newsData = {};
        request(NEWS_PAGE, (err, res, body) => {
            if (err) return reject(err);

            let $ = cheerio.load(body);

            fs.readJson(join(__dirname, "savedVars.json"), (err, savedVars) => {
                if (err) return reject(err);

                newsData.text = $(" hgroup ").find(" h2.text-info ").text();
                if (newsData.text === savedVars.text) return reject("modules.esoNews: No new articles present");

                newsData.link = ESO_DOMAIN + $(" .hilight-image > a ").prop("href");
                request(newsData.link, (err, res, newsPage) => {
                    if (err) return reject(err);

                    $ = cheerio.load(newsPage);

                    newsData.title = $(" div.post-title ").find(" h1 ").text();
                    newsData.pubDate = new Date($(" div.post-title ").find(" span.date ").text());
                    newsData.description = $(" #post-body > div > p > i ").first().text();
                    newsData.image = $(" #post-body > div > p > img ").prop("src");

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
        .setAuthor("ESO News", constants.icons.eso, NEWS_PAGE)
        .setTitle(data.title)
        .setDescription(data.description)
        .setImage(data.image || "")
        .setFooter(`Brought to you by © Grogsile Inc. | ${utils.fancyESODate(data.pubDate)}`, constants.icons.grogsile)
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
