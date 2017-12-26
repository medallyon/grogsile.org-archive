const request = require("request")
, cheerio = require("cheerio")
, toMarkdown = require("to-markdown");

const uesp = {
    domain: "http://en.uesp.net",
    baseSearchURL: "http://en.uesp.net/w/index.php?title=Special%3ASearch&search=",
    iconURL: "http://en.uesp.net/w/extensions/UespCustomCode/files/UespLogo.jpg",
    namespaces: new Discord.Collection(require(join(__dirname, "namespaces.json"))),
    types: [
        "People",
        "Books",
        "Quests:",
        "Places:"
    ]
}
, numberEmoji = [
    "1⃣",
    "2⃣",
    "3⃣",
    "4⃣",
    "5⃣",
    "6⃣",
    "7⃣",
    "8⃣",
    "9⃣",
    "🔟"
];

function createAmbiguityEmbed(results, arg)
{
    let e = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor("Search Results", uesp.iconURL, encodeURI(uesp.baseSearchURL + arg))
        .setDescription(`You searched for **${arg}**. This is what came up:`)
        .setFooter(`${constants.discord.embed.footer.text} | ${utils.fancyESODate()} ${dateFormat("HH:MM")} UTC`, constants.discord.embed.footer.icon_url);

    for (let i = 0; i < results.length; i++)
    {
        let $r = results[i];
        let $title = $r.children().first();
        e.addField(`${i+1}. ${$title.children(" a ").prop("title")}`, `[${$title.children(" a ").prop("href")}](${uesp.domain}${$title.children(" a ").prop("href")})`, true);
    }
    e.addField("\u200b", "**Please select one of the following emoji to show the appropriate article.**", false);

    return e;
}

addReactions = {
    stopped: false,

    init: function(message, from, to)
    {
        if (!this.stopped)
        {
            message.react(numberEmoji[from])
            .then(reaction => {
                if (from < to) addReactions.init(message, from + 1, to);
            }).catch(err => {
                console.error(err);
                if (from < to) addReactions.init(message, from + 1, to);
            });
        }
    },

    stop: function()
    {
        this.stopped = true;
    }
}

function awaitUserReactionFor(results, msg)
{
    addReactions.stopped = false;
    return new Promise(function(resolve, reject)
    {
        msg.channel.send({ embed: createAmbiguityEmbed(results, msg.args.join(" ")) })
        .then(function(message)
        {
            addReactions.init(message, 0, results.length - 1);

            const reactionFilter = (r, u) => (u.id === msg.author.id && numberEmoji.includes(r.emoji.name));
            message.awaitReactions(reactionFilter, { max: 1, time: 1000 * 45, errors: ["time"] })
            .then(function(reactions)
            {
                addReactions.stop();
                resolve([reactions.first(), message]);
            }).catch((collected, reason) => {
                reject([reason, message]);
            });
        }).catch(reject);
    });
}

function searchWiki(arg)
{
    let resolved = false;
    return new Promise(function(resolve, reject)
    {
        if (Array.from(uesp.namespaces.keys()).some(k => k.toLowerCase() === arg.split(":")[0].toLowerCase() && arg.split(":").length === 1)) arg = arg + ":Main_Page";
        let [namespace, title] = arg.split(":");
        if (!title) title = namespace;

        request((uesp.baseSearchURL + arg), function(err, res, body)
        {
            if (err) return reject(err);
            if (!body) reject(new Error("body is corrupt"));

            let $ = cheerio.load(body);

            // search page was found
            if ($(` h1#firstHeading > span[dir="auto"] `).text() === "Search results")
            {
                let results = [];

                // no result was found
                if ($(` p.mw-search-nonefound `).length) return reject(new Error("ENOENT"));

                // only a single search result was found
                if ($(` ul.mw-search-results > li `).length === 1)
                {
                    request((uesp.domain + $(` ul.mw-search-results > li `).find(" a ").prop("href")), function(err, res2, articleBody)
                    {
                        if (err) return;
                        if (!resolved) resolve(cheerio.load(articleBody));
                        resolved = true;
                    });
                }

                // for if there is only 1 namespace with an exactly matching title
                let matchingResults = [];

                // collect first 10 results and resolve
                $(` ul.mw-search-results > li `).each(function(i)
                {
                    results.push($(this));

                    let resultTitle = $(this).find("a").prop("title").split(":")[1] || "";
                    if (resultTitle.toLowerCase() === title.toLowerCase()) matchingResults.push($(this));

                    if (i >= 9 && matchingResults.length === 1)
                    {
                        request((uesp.domain + matchingResults[0].children(` .mw-search-result-heading `).find(" a ").prop("href")), function(err, res2, articleBody)
                        {
                            if (err) return;
                            if (!resolved) resolve(cheerio.load(articleBody));
                            resolved = true;
                        });
                        return false;
                    } else

                    if (i >= 9)
                    {
                        if (!resolved) resolve(results);
                        return false;
                    }
                });
            }

            // a specific page has been found and returned
            else
            {
                resolve($);
            }
        });
    });
}

function removeUnnessecaryHTML(html)
{
    return html.replace(/<\/?span.*?>/g, "").replace(/<\/?sup.*?>/g, "").replace(/<\/?small.*?>/g, "").replace(/<\/?big.*?>/g, "");
}

function filterOutAllHTML(html)
{
    return html.replace(/<\/?.+?>/g, "");
}

function filterOutImagesFromHTML(html)
{
    return html.replace(/<\/?img.+?>/g, "");
}

function filterOutImagesFromMD(markdown)
{
    return markdown.replace(/!\[.+?\]\(.+?\)/g, "");
}

const restrictedImages = [
    "//images.uesp.net//thumb/b/b4/ON-icon-ActiveFrame.png/48px-ON-icon-ActiveFrame.png",
    "//images.uesp.net//thumb/3/39/ON-icon-achievement-Blank.png/48px-ON-icon-achievement-Blank.png",
    "//images.uesp.net//thumb/5/51/ON-icon-Thieves_Guild.png/32px-ON-icon-Thieves_Guild.png",
    "//images.uesp.net//thumb/0/06/ON-icon-PassiveFrame.png/48px-ON-icon-PassiveFrame.png"
];
function imageIsRestricted(img)
{
    return restrictedImages.includes(img);
}

function replaceInvalidMDLinks(markdown, baseURL = "")
{
    let linkRegExp = /\[.*?\]\((.+?) .*?\)/g;
    let matches;
    while ((matches = linkRegExp.exec(markdown)) !== null) {
        markdown = markdown.replace(matches[1], uesp.domain + matches[1]);
    }

    let jumpRegExp = /\[.*?\]\((#.+?)\)/g;
    while ((matches = jumpRegExp.exec(markdown)) !== null) {
        markdown = markdown.replace(matches[1], baseURL + matches[1]);
    }

    return markdown;
}

class WikiEmbed extends Discord.MessageEmbed
{
    constructor($, data = [])
    {
        super(data);

        this.$ = $;

        this.type;
        $(" .subpages ").text().split(" ").some(x => {
            if (!uesp.types.includes(x)) return false;
            this.type = x;
            return true;
        });

        // these values will always be embedded
        super.setColor(utils.randColor());
        super.setFooter(`${constants.discord.embed.footer.text} | ${utils.fancyESODate()} ${dateFormat("HH:MM")} UTC`, constants.discord.embed.footer.icon_url);

        // these are the default values for the embed content
        this.namespace = $(" #firstHeading ").text().split(":")[0];
        this.title = $(" #firstHeading ").text().split(":")[1];
        this.url = `${uesp.domain}/wiki/${encodeURI(this.namespace + ":" + this.title)}`;
        this.description = (!$(" #mw-content-text > p ").first().html()) ? $(" #mw-content-text > p ").first().text() || "" : removeUnnessecaryHTML(replaceInvalidMDLinks(filterOutImagesFromMD(toMarkdown($(" #mw-content-text > p ").first().html()))), this.url) || "";
        this.image = $(" .fullImageLink ").find(" img ").prop("src") || $(" .thumb ").find(" img ").prop("src") || $(" .image ").find(" img ").prop("src") || "";

        console.log(this.url);

        for (let i = 0; i < $(" img ").length; i++)
        {
            if (!imageIsRestricted(this.image)) break;
            this.image = $(" img ").eq(i).prop("src");
        }

        if (this.image.startsWith("//images.uesp.net")) this.image = this.image.replace("//images.uesp.net/", "http://images.uesp.net");
        if (this.image.includes("/thumb/")) this.image = this.image.replace("thumb\/", "");

        super.setAuthor(this.namespace, uesp.namespaces.has(this.namespace) ? uesp.namespaces.get(this.namespace).icon : "", uesp.namespaces.has(this.namespace) ? encodeURI(uesp.namespaces.get(this.namespace).link) : "");
        super.setTitle(this.title);
        super.setURL(this.url);
        super.setDescription(this.description);
        super.setImage(this.image);

        if ($(` table.infobox `).length)
        {
            let fields = [];
            $(` table.infobox > tr `).each(function(i)
            {
                if ($(this).children().length >= 2)
                {
                    let intermediateName;
                    $(this).children().each(function(j)
                    {
                        if (j % 2 === 1) fields.push({ name: intermediateName, value: removeUnnessecaryHTML(replaceInvalidMDLinks(toMarkdown($(this).html())), this.url), inline: true });
                        intermediateName = (!$(this).text().length || !$(this).text()) ? "\u200b" : $(this).text();
                    });
                }

                if (i >= 7) return false;
            });
            this.fields = fields;
        }

        if (!this.fields || !this.fields.length) this.fields = [];
        let fields = [];
        switch(this.type)
        {
            case "Books":
                super.setDescription(toMarkdown($(" .book > p ").first().text()));
                break;

            case "Quests:":
                $(` ol > li `).each(function(i)
                {
                    fields.push({ name: `Step ${i + 1}`, value: removeUnnessecaryHTML(replaceInvalidMDLinks(toMarkdown($(this).html()), this.url)), inline: true });
                });
                this.fields = this.fields.concat(fields);
                break;

            default:
                break;
        }
    }
}

function processWikiPage($result)
{
    return new Promise(function(resolve, reject)
    {
        request((uesp.domain + $result.find(" a ").prop("href")), function(err, res, body)
        {
            if (err) return reject(err);
            if (!body) return reject(new Error("body is corrupt"));

            let $ = cheerio.load(body);

            let embed;
            try {
                embed = new WikiEmbed($);
            }
            catch(err) {
                return reject(new Error("body is corrupt"));
            }

            resolve(embed);
        });
    });
}

function sendError(err, channel)
{
    console.error(err);
    channel.send(":x: That didn't work. :/").catch(console.error);
}

function wiki(msg)
{
    searchWiki(msg.args.join(" ")).then(function(result)
    {
        if (Array.isArray(result))
        {
            awaitUserReactionFor(result, msg)
            .then(function([reaction, sentMessage])
            {
                processWikiPage(result[numberEmoji.indexOf(reaction.emoji.name)])
                .then(embed => {
                    sentMessage.clearReactions().catch(console.error);
                    sentMessage.edit({ embed: embed }).catch(console.error);
                }).catch(err => {
                    console.error(err);
                    sentMessage.clearReactions().catch(console.error);
                    sentMessage.edit(":x: That didn't work. :/").catch(console.error);
                });
            })
            .catch(function([err, sentMessage])
            {
                console.error(err);
                addReactions.stop();
                sentMessage.clearReactions().catch(console.error);
            });
        }

        else
        {
            let embed;
            try {
                embed = new WikiEmbed(result);
                msg.channel.send({ embed: embed }).catch(console.error);
            }
            catch(err) {
                console.error(err);
                msg.channel.send(":x: That didn't work. :/").catch(console.error);
            }
        }
    }).catch(err => {
        if (err.message === "ENOENT") msg.channel.send(`Could not find anything for **${msg.args.join(" ")}**.`);
        else sendError(err, msg.channel);
    });
}

// where it sends "That didn't work. :/" is where `request`ed `body` objects are corrupt/cannot be read
// I have a hunch that this might be part of requesting articles from the `Tes3Mod:Tamriel Rebuilt` Namespace
// where this module only handles single-worded Namespaces.

module.exports = wiki;
