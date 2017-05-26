const fs = require("fs-extra")
, path = require("path")
, join = path.join

, Discord = require("discord.js")

, request = require("request")
, cheerio = require("cheerio");

const STATUS_DOMAIN = "https://esoserverstatus.net/";

function getServers()
{
    return new Promise(function(resolve, reject)
    {
        request(STATUS_DOMAIN, function(err, res, body)
        {
            if (err) reject(err);

            let $ = cheerio.load(body);

            let servers = [];
            $(".list-group > .list-group-item > .list-group-item-heading").each(function()
            {
                // push [server, status] to 'servers'
                servers.push([$(this).first().text(), $(this).first().next().text().toLowerCase()]);
            });

            let messages = getStatusMessages($);

            resolve([messages, servers]);
        });
    });
}

function getStatusMessages($)
{
    if ($(".panel-title").length)
    {
        let messages = [];
        $(".panel-title").each(function()
        {
            let message = $(this).text().replace(/\\r|\\n|\\t/g, "");
            if (message.includes("Maintenance is ongoing")) message = message.replace("Maintenance is ongoing", "");
            if (/(.*)last updated/gi.test(message)) message = message.match(/(.*)last updated/i)[1];

            messages.push(message);
        });

        return messages;
    } else return [];
}

function servers(msg)
{
    getServers().then(function([messages, servers])
    {
        let embed = new Discord.RichEmbed();

        embed.setAuthor("ESO Server Status", "http://i.imgur.com/qLjwOdQ.png", "https://esoserverstatus.net/#")
        .setColor(utils.randColor())
        .setDescription("Shown below is the status of every ESO server.")
        .setFooter("Brought to you by Grogsile Inc. | " + utils.fancyESODate(new Date()));

        if (messages.length)
        {
            for (let message of messages)
            {
                embed.addField("Message", message);
            }
        }

        embed.addField("\u200b", "**[PC/Mac]**")
        embed.addField("Europe", (servers[0][1].includes("online")) ? "💚 Online" : "💔 Offline", true);
        embed.addField("North America", (servers[1][1].includes("online")) ? "💚 Online" : "💔 Offline", true);
        embed.addField("PTS", (servers[2][1].includes("online")) ? "💚 Online" : "💔 Offline", false);

        embed.addField("\u200b", "**[XBOX One]**");
        embed.addField("Europe", (servers[3][1].includes("online")) ? "💚 Online" : "💔 Offline", true);
        embed.addField("North America", (servers[4][1].includes("online")) ? "💚 Online" : "💔 Offline", true);

        embed.addField("\u200b", "**[PS4]**");
        embed.addField("Europe", (servers[5][1].includes("online")) ? "💚 Online" : "💔 Offline", true);
        embed.addField("North America", (servers[6][1].includes("online")) ? "💚 Online" : "💔 Offline", true);

        msg.channel.send({ embed: embed }).catch(console.error);
    }).catch(console.error);
}

module.exports = servers;
