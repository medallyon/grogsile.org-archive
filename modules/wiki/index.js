// packages
const Discord = require("discord.js")
, request = require("request")
, cheerio = require("cheerio")
, toMarkdown = require("to-markdown");

const UESP_DOMAIN = "http://en.uesp.net"
, UESP_API = "http://en.uesp.net/w/api.php"
, userAgent = "uespQuery/1.0.0 (http://github.com/medallyon; traendchen@outlook.com) Node.js/6.9";

function constructAPIString(options)
{
    let apiString = `${UESP_API}?`;
    for (let parameter in options) {
        apiString += `${parameter}=${(Array.isArray(options[parameter]) ? options[parameter].join("|") : options[parameter])}&`;
    }
    if (!options.hasOwnProperty("action")) apiString += "action=query&";
    if (!options.hasOwnProperty("format")) apiString += "format=json";
    return apiString;
}

function getNamespaceId(title)
{
    let namespace = title.split(":")[0].toLowerCase();
    switch (namespace) {
        case "arena":
            return 102;
        case "daggerfall":
            return 104;
        case "oblivion":
            return 116;
        case "lore":
            return 130;
        case "skyrim":
            return 134;
        case "online":
            return 144;
        case "legends":
            return 150;
        default:
            return 0;
    }
}

function fetchWikiHTML(url)
{
    return new Promise(function(resolve, reject)
    {
        request(url, (err, req, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
}

function normalizeWikiHTML(jqueryObj)
{
    let $ = jqueryObj;
    $("sup").remove();
    return $;
}

function parseWikiDescription(html)
{
    let $ = normalizeWikiHTML(cheerio.load(html));
    let raw = "";

    $("#mw-content-text > p").each((i, x) => {
        raw += $(x).html() + "\n";
    });

    if (raw.length === 0)
    {
        $("#mw-content-text > div > div > i").each((i, x) => {
            raw += "*" + $(x).html() + "*\n";
        });
    }

    if (raw.length === 0)
    {
        $("#mw-content-text > div > div > i").each((i, x) => {
            raw += "*" + $(x).html() + "*\n";
        });
    }

    raw = raw.split("\n")[0];

    let text = toMarkdown(raw);

    text = text.replace(/\/wiki/g, `${UESP_DOMAIN}\/wiki`);
    text = text.replace(/\<.*?\>/g, "");
    text = text.replace(/\[\!\[.*?\.png\]\(.*?\.png\)\]\(.*?\.png\)|\[\!\[.*?\.jpg\]\(.*?\.jpg\)\]\(.*?\.jpg\)/g, "");

    return text;
}

function fetchWikiImage(file)
{
    return new Promise(function(resolve, reject)
    {
        if (file === undefined) reject();
        request(`http://en.uesp.net/wiki/File:${file}`, (err, res, body) => {
            if (err) reject(err);

            let $image = cheerio.load(body);
            resolve(UESP_DOMAIN + $image("#file > a").attr("href"));
        });
    });
}

function filterWikiImages(images)
{
    return images.filter(a => {
        return (a !== "Padlock-silver.png" &&
            a !== "Padlock18-silver.png" &&
            a !== "Padlock-red.png" &&
            a !== "Padlock-olive.png" &&
            a !== "Padlock-skyblue.png" &&
            a !== "Padlock-blue.png" &&
            a !== "ON-icon-Orsinium.png" &&
            a !== "ON-misc-Crown.png" &&
            a !== "Split-arrows.gif"
        );
    });
}

function getCategoryIcon(cat)
{
    switch (cat.toLowerCase()) {
        case "arena":
            return "http://i.imgur.com/oGVeVLr.png";
        case "daggerfall":
            return "http://i.imgur.com/VHQWBQn.png";
        case "morrowind":
            return "http://i.imgur.com/fa6L2kM.png";
        case "oblivion":
            return "http://i.imgur.com/EFkneWZ.png";
        case "skyrim":
            return "http://i.imgur.com/QPppr1t.png";
        case "online":
            return "http://i.imgur.com/ThuQei5.png";
        case "legends":
            return "http://i.imgur.com/obR4zcO.jpg";
        case "lore":
            return "http://i.imgur.com/pAShPCj.png";
        default:
            return "";
    }
}

function constructEmbed(data)
{
    return new Promise(function(resolve, reject)
    {
        let e = new Discord.RichEmbed()
            .setColor("#FAEBD7")
            .setAuthor(data.title.split(":")[0], getCategoryIcon(data.title.split(":")[0]), `http://en.uesp.net/wiki/${data.title.split(":")[0]}:Main_Page`)
            .setTitle(data.title.split(":").slice(1).join(":"))
            .setURL(`http://en.uesp.net/wiki/${data.title.split(" ").join("%20")}`)
            .setDescription(parseWikiDescription(data.text["*"]))
            .setFooter(`(UESP) Brought to you by Grogsile Inc. | ${utils.fancyESODate(new Date())}`, "https://i.grogsile.me/favicon.png");

        fetchWikiHTML(`http://en.uesp.net/wiki/${data.title}`)
            .then(html => {
                e.setDescription(parseWikiDescription(html));
                fetchWikiImage(filterWikiImages(data.images)[0])
                    .then(image => {
                        resolve(e.setThumbnail(image));
                    }).catch(err => {
                        resolve(e);
                    });
            }).catch(console.error);
    });
}

function searchQuery(string)
{
    return new Promise(function(resolve, reject)
    {
        let apiString = constructAPIString({
            list: "search",
            srnamespace: [102, 104, 116, 130, 134, 144, 150],
            srlimit: 500,
            srsearch: string
        });

        request(apiString, (err, res, body) => {
            if (err) reject(err);

            let results = JSON.parse(body).query;
            if (results.searchinfo.totalhits === 0) reject("No results found.");

            let firstResult = results.search[0];
            if (!firstResult) return reject();
            request(constructAPIString({ action: "parse", page: firstResult.title }), (err2, res2, wikipage) => {
                if (err2) reject(err2);

                constructEmbed(JSON.parse(wikipage).parse)
                    .then(embed => {
                        resolve(embed);
                    }).catch(console.error);
            });
        });
    })
}

function wiki(msg) {
    if (!msg.args.length) return msg.channel.sendMessage("This command cannot be initiated without any query to search for. Try again with a search parameter.\nTry `/help wiki` if you're unsure.");

    searchQuery(msg.args.join()).then(embed => {
        msg.channel.sendEmbed(embed).catch(console.error);
    }).catch((err) => {
        msg.channel.sendMessage("```js\n" + err + "```\n**Try to be more concise with your queries.**");
    });
}

module.exports = wiki;
