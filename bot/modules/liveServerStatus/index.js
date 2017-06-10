const LIVE_CHANNEL = "319641305388941315"
, STATUS_DOMAIN = "https://eso.xc.ms/";

function structureEmbed(status)
{
    let e = new Discord.RichEmbed(constants.discord.embed)
        .setAuthor("ESO Server Status", dClient.user.displayAvatarURL, STATUS_DOMAIN)
        .setDescription("This live panel is updated every 5 minutes to check for all ESO Server Statuses.")
        .setFooter(`Brought to you by Grogsile, Inc. | ${utils.fancyESODate(new Date())} ${new Date().getUTCHours()}:${new Date().getUTCMinutes()} UTC`);

    e.addField("\u200b", "**[PC]**");
    for (let server in status["PC"])
    {
        e.addField(server, status["PC"][server] ? "💚 Online" : "💔 Offline", true);
    }

    e.addField("\u200b", "**[PS4]**");
    for (let server in status["PS4"])
    {
        e.addField(server, status["PS4"][server] ? "💚 Online" : "💔 Offline", true);
    }

    e.addField("\u200b", "**[XBONE]**");
    for (let server in status["XBONE"])
    {
        e.addField(server, status["XBONE"][server] ? "💚 Online" : "💔 Offline", true);
    }

    return e;
}

function liveServerStatus()
{
    let statusChannel = dClient.guilds.get(constants.discord.esoi.id).channels.get(LIVE_CHANNEL);

    fs.readJson(join(__dirname, "savedVars.json"), function(err, savedVars)
    {
        if (err) return console.error(err);

        let statusMessageId = savedVars.message;

        utils.fetchServerStatus().then(function(status)
        {
            if (!statusMessageId || statusMessageId === "0")
            {
                statusChannel.send({ embed: structureEmbed(status) }).then(message => {
                    savedVars.message = message.id;

                    fs.outputJson(join(__dirname, "savedVars.json"), savedVars);
                });
            }

            else
            {
                statusChannel.fetchMessage(statusMessageId).then(function(msg)
                {
                    msg.edit({ embed: structureEmbed(status) });
                }).catch(console.error);
            }
        }).catch(console.error);
    });
}

module.exports = liveServerStatus;
