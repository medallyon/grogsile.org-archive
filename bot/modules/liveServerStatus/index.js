const LIVE_CHANNEL = "319641305388941315"
, STATUS_DOMAIN = "https://eso.xc.ms/";

function structureEmbed(status)
{
    let e = new Discord.RichEmbed()
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

function prepareAnnouncement(servers)
{
    let e = new Discord.RichEmbed()
        .setAuthor("ESO Server Status", dClient.user.displayAvatarURL, STATUS_DOMAIN)
        .setDescription("The following servers have been updated:")
        .setFooter(`Brought to you by Grogsile, Inc. | ${utils.fancyESODate(new Date())} ${new Date().getUTCHours()}:${new Date().getUTCMinutes()} UTC`)
    , strings = [];

    if (servers.findIndex(x => x.platform === "PC") > -1)
    {
        for (let server of servers.filter(s => s.platform === "PC"))
        {
            strings.push(`The **${(server.server === "NA") ? "North American [NA]" : ((server.server === "EU") ? "European [EU]" : "Public Test [PTS]")}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("PC", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "PS4") > -1)
    {
        for (let server of servers.filter(s => s.platform === "PS4"))
        {
            strings.push(`The **${(server.server === "NA") ? "North American [NA]" : "European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("PlayStation 4", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "XBONE") > -1)
    {
        for (let server of servers.filter(s => s.platform === "XBONE"))
        {
            strings.push(`The **${(server.server === "NA") ? "North American [NA]" : "European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("XBox One", strings.join("\n"), false);
    }

    return e;
}

function toggleRole(role)
{
    return role.setMentionable(!role.mentionable);
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
            let changedServers = [];
            for (let platform in status)
            {
                for (let server in status[platform])
                {
                    if (savedVars.status[platform][server] !== status[platform][server])
                    {
                        changedServers.push({ platform: platform, server: server, status: status[platform][server] });
                    }
                }
            }
            savedVars.status = status;

            const finalEmbed = structureEmbed(status);
            statusChannel.fetchMessage(statusMessageId)
            .then(liveMessage => {
                statusChannel.fetchMessage(statusMessageId).then(function(msg)
                {
                    msg.edit({ embed: finalEmbed });

                    fs.outputJson(join(__dirname, "savedVars.json"), savedVars);
                }).catch(console.error);
            })
            .catch(err => {
                statusChannel.send({ embed: finalEmbed }).then(message => {
                    savedVars.message = message.id;

                    fs.outputJson(join(__dirname, "savedVars.json"), savedVars);
                });
            });

            if (changedServers.length)
            {
                let roleToMention = statusChannel.guild.roles.get(constants.discord.esoi.roles.ServerUpdates);

                if (!roleToMention.mentionable)
                {
                    toggleRole(roleToMention)
                    .then(role => {
                        statusChannel.guild.channels.find("name", "announcements").send(roleToMention.toString(), { embed: prepareAnnouncement(changedServers) }).catch(console.error)
                        .then(msg => {
                            toggleRole(role).catch(console.error);
                        });
                    }).catch(console.error);
                }

                else
                {
                    statusChannel.guild.channels.find("name", "announcements").send(roleToMention.toString(), { embed: prepareAnnouncement(changedServers) }).catch(console.error)
                    .then(msg => {
                        toggleRole(roleToMention).catch(console.error);
                    });
                }
            }
        }).catch(console.error);
    });
}

module.exports = liveServerStatus;
