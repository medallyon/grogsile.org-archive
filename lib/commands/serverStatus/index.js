const Discord = require("discord.js");

const STATUS_DOMAIN = "https://eso.xc.ms/";

function structureEmbed(status, platform = null)
{
    let e = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
        .setAuthor("ESO Server Status", "", STATUS_DOMAIN)
        .setDescription("💚 Everything seems to be in order. All servers are Online.")
        .setFooter(`${dClient.constants.discord.embed.footer.text} | ${dClient.modules.utils.fancyESODate()} ${dClient.libs.dateFormat("HH:MM")} UTC`, dClient.constants.discord.embed.footer.icon_url);

    const now = new Date();

    if (!platform || platform === "pc")
    {
        e.addField("\u200b", "**PC**");
        for (const server in status["PC"])
        {
            e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PC"][server] ? "💚 Online" : "💔 Offline", true);

            if (!status["PC"][server] && (now.getUTCDay() == 1 && (now.getUTCTime() >= 8 && now.getUTCTime() <= 16))) e.setDescription("💔 Is it Morndas already? Must be Maintenance. :tools:");
            else if (!status["PC"][server]) e.setDescription("💔 Something is out of the norm... Some Servers are offline!");
        }
    }

    if (!platform || platform === "ps4" || platform === "consoles")
    {
        e.addField("\u200b", "**PlayStation 4**");
        for (const server in status["PS4"])
        {
            e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PS4"][server] ? "💚 Online" : "💔 Offline", true);

            if (!status["PS4"][server] && (now.getUTCDay() == 2 && (now.getUTCTime() >= 10 && now.getUTCTime() <= 18))) e.setDescription("💔 Is it Tirdas already? Must be Maintenance. :tools:");
            else if (!status["PS4"][server]) e.setDescription("💔 Something is out of the norm... Some Servers are offline!");
        }
    }

    if (!platform || platform === "xbone" || platform === "consoles")
    {
        e.addField("\u200b", "**XBox One**");
        for (const server in status["XBONE"])
        {
            e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["XBONE"][server] ? "💚 Online" : "💔 Offline", true);

            if (!status["XBONE"][server] && (now.getUTCDay() == 3 && (now.getUTCTime() >= 10 && now.getUTCTime() <= 18))) e.setDescription("💔 Is it Middas already? Must be Maintenance. :tools:");
            else if (!status["XBONE"][server]) e.setDescription("💔 Something is out of the norm... Some Servers are offline!");
        }
    }

    return e;
}

const pVars = {
    "pc": [ "pc", "not consoles" ],
    "ps4": [ "playstation", "play station", "ps", "ps4" ],
    "xbone": [ "xbox", "xbox one", "xbox1", "xb1", "xbone" ],
    "consoles": [ "console", "consoles" ]
};

function serverStatus(msg)
{
    dClient.libs.fs.readJson(dClient.libs.join(__lib, "commands", "liveServerStatus", "savedVars.json")).then(function(savedVars)
    {
        let finalEmbed = structureEmbed(savedVars.status);
        if (msg.args.length)
        {
            if (Object.keys(pVars).some(x => pVars[x].some(p => p === msg.args.join(" ").toLowerCase()))) finalEmbed = structureEmbed(savedVars.status, Object.keys(pVars).filter(x => pVars[x].some(p => msg.args.join(" ").toLowerCase().includes(p)))[0]);
        }

        msg.channel.send({ embed: finalEmbed }).catch(console.error);
    }).catch(console.error);
}

module.exports = serverStatus;
