const STATUS_DOMAIN = "https://eso.xc.ms/";

function structureEmbed(status)
{
    let e = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor("ESO Server Status", "", STATUS_DOMAIN)
        .setDescription("This live panel is updated every 5 minutes to check for all ESO Server Statuses.")
        .setFooter(`${constants.discord.embed.footer.text} | ${utils.fancyESODate()} ${dateFormat("HH:MM")} UTC`, constants.discord.embed.footer.icon_url);

    e.addField("\u200b", "**PC**");
    for (let server in status["PC"])
    {
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PC"][server] ? "💚 Online" : "💔 Offline", true);
    }

    e.addField("\u200b", "**PlayStation 4**");
    for (let server in status["PS4"])
    {
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PS4"][server] ? "💚 Online" : "💔 Offline", true);
    }

    e.addField("\u200b", "**XBox One**");
    for (let server in status["XBONE"])
    {
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["XBONE"][server] ? "💚 Online" : "💔 Offline", true);
    }

    return e;
}

function prepareAnnouncement(servers)
{
    let e = new Discord.MessageEmbed()
        .setAuthor("ESO Server Status", "", STATUS_DOMAIN)
        .setDescription("The following servers have been updated:")
        .setFooter(`Brought to you by Grogsile, Inc. | ${utils.fancyESODate(new Date())} ${dateFormat("HH:MM")} UTC`, constants.discord.embed.footer.icon_url)
    , strings = [];

    if (servers.findIndex(x => x.platform === "PC") > -1)
    {
        for (let server of servers.filter(s => s.platform === "PC"))
        {
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ((server.server === "EU") ? ":flag_eu: European [EU]" : "Public Test [PTS]")}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("PC", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "PS4") > -1)
    {
        for (let server of servers.filter(s => s.platform === "PS4"))
        {
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ":flag_eu: European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("PlayStation 4", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "XBONE") > -1)
    {
        for (let server of servers.filter(s => s.platform === "XBONE"))
        {
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ":flag_eu: European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        }
        e.addField("XBox One", strings.join("\n"), false);
    }

    return e;
}

function deletePreviousUpdate(doDelete, channel, id)
{
    return new Promise(function(resolve, reject)
    {
        if (!doDelete) return resolve(null);

        channel.messages.fetch(id)
        .then(msg => {
            resolve(msg.delete());
        }).catch(resolve);
    });
}

function liveServerStatus()
{
    utils.fetchServerStatus().then(function(status)
    {
        fs.readJson(join(__dirname, "savedVars.json")).then(function(savedVars)
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
            fs.outputJson(join(__dirname, "savedVars.json"), savedVars).catch(console.error);
            
            const finalPanelEmbed = structureEmbed(status)
            , finalUpdateEmbed = prepareAnnouncement(changedServers);

            if (!status.PC.EU && !status.PC.NA) dClient.maintenance = true;
            else dClient.maintenance = false;

            for (let guild of dClient.guilds.values())
            {
                if (!guild.available || !guild.config) continue;

                const baseGuildPath = join(__data, "guilds", guild.id);

                if (!guild.config.guild.liveServerStatus.panel.enabled && !guild.config.guild.liveServerStatus.update.enabled) continue;

                else
                {
                    fs.readJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json")).then(function(liveVars)
                    {
                        // live panel
                        if (guild.config.guild.liveServerStatus.panel.enabled)
                        {
                            let liveChannel = guild.channels.get(guild.config.guild.liveServerStatus.panel.channel);

                            liveChannel.messages.fetch(liveVars.panelId)
                            .then(panelMessage => {
                                panelMessage.edit({ embed: finalPanelEmbed }).catch(console.error);
                            }).catch(err => {
                                liveChannel.send({ embed: finalPanelEmbed })
                                .then(function(sentMessage)
                                {
                                    liveVars.panelId = sentMessage.id;
                                    fs.outputJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), liveVars).catch(console.error);
                                }).catch(console.error);
                            });
                        }

                        // global announcements
                        if (guild.config.guild.liveServerStatus.update.enabled)
                        {
                            if (changedServers.length)
                            {
                                let updateChannel = guild.channels.get(guild.config.guild.liveServerStatus.update.channel)
                                , roles = guild.config.guild.liveServerStatus.update.roles.map(x => guild.roles.get(x));

                                utils.toggleRoles(guild.config.guild.liveServerStatus.update.toggleRoles, roles.filter(r => !r.mentionable))
                                .then(function(modifiedRoles)
                                {
                                    deletePreviousUpdate(guild.config.guild.liveServerStatus.update.deletePrevious, updateChannel, liveVars.updateId)
                                    .then(function(deletedMessage)
                                    {
                                        updateChannel.send(roles.map(r => r.toString()).join(" "), { embed: finalUpdateEmbed })
                                        .then(sentMessage => {
                                            utils.toggleRoles(guild.config.guild.liveServerStatus.update.toggleRoles, roles);
                                            liveVars.updateId = sentMessage.id;
                                            fs.outputJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), liveVars, (err) => { if (err) console.error(err) });
                                        }).catch(console.error);
                                    });
                                }).catch(console.error);
                            }
                        }
                    }).catch(console.error);
                }
            }
        }).catch(console.error);
    }).catch(console.error);
}

module.exports = liveServerStatus;
