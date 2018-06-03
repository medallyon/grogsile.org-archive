const Discord = require("discord.js");

const STATUS_DOMAIN = "https://eso.xc.ms/";

function structureEmbed(status)
{
    let e = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor("ESO Server Status", "", STATUS_DOMAIN)
        .setDescription("This live panel is updated every 5 minutes to check for all ESO Server Statuses.")
        .setTimestamp(new Date());

    e.addField("\u200b", "**PC**");
    for (const server in status["PC"])
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PC"][server] ? "💚 Online" : "💔 Offline", true);

    e.addField("\u200b", "**PlayStation 4**");
    for (const server in status["PS4"])
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["PS4"][server] ? "💚 Online" : "💔 Offline", true);

    e.addField("\u200b", "**XBox One**");
    for (const server in status["XBONE"])
        e.addField(`:${((server === "EU") ? "flag_eu" : ((server === "NA") ? "flag_us" : "tools"))}: ` + server, status["XBONE"][server] ? "💚 Online" : "💔 Offline", true);

    return e;
}

function prepareAnnouncement(servers)
{
    let e = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor("ESO Server Status", "", STATUS_DOMAIN)
        .setDescription("The following servers have been updated:")
        .setTimestamp(new Date())
    , strings = [];

    if (servers.findIndex(x => x.platform === "PC") > -1)
    {
        for (const server of servers.filter(s => s.platform === "PC"))
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ((server.server === "EU") ? ":flag_eu: European [EU]" : "Public Test [PTS]")}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        e.addField("PC", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "PS4") > -1)
    {
        for (const server of servers.filter(s => s.platform === "PS4"))
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ":flag_eu: European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        e.addField("PlayStation 4", strings.join("\n"), false);
    }
    strings = [];

    if (servers.findIndex(x => x.platform === "XBONE") > -1)
    {
        for (const server of servers.filter(s => s.platform === "XBONE"))
            strings.push(`The **${(server.server === "NA") ? ":flag_us: North American [NA]" : ":flag_eu: European [EU]"}** MegaServer is now ${(server.status) ? "💚 **Online**" : "💔 **Offline**"}`);
        e.addField("XBox One", strings.join("\n"), false);
    }

    return e;
}

function deletePreviousUpdate(doDelete, channel, id)
{
    return new Promise(function(resolve)
    {
        if (!doDelete)
            return resolve(null);

        channel.messages.fetch(id)
            .then(function(msg)
            {
                resolve(msg.delete());
            }).catch(resolve);
    });
}

function liveServerStatus()
{
    dClient.modules.utils.fetchServerStatus().then(function(status)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(savedVars)
        {
            let changedServers = [];
            for (let platform in status)
            {
                for (let server in status[platform])
                {
                    if (savedVars.status[platform][server] !== status[platform][server])
                        changedServers.push({ platform: platform, server: server, status: status[platform][server] });
                }
            }

            savedVars.status = status;
            dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), savedVars).catch(dClient.modules.utils.consoleError);
            
            const finalPanelEmbed = structureEmbed(status)
            , finalUpdateEmbed = prepareAnnouncement(changedServers);

            if (!status.PC.EU && !status.PC.NA)
            {
                if (!dClient.eso.maintenance)
                    dClient.eso.setServerMaintenance(true);
            }
            
            else
            {
                if (dClient.eso.maintenance)
                    dClient.eso.setServerMaintenance(false);
            }

            for (let guild of dClient.guilds.values())
            {
                if (!guild.available || !guild.config)
                    continue;

                const baseGuildPath = dClient.libs.join(__data, "guilds", guild.id);

                if (!guild.config.eso.liveServerStatus.panel.enabled && !guild.config.eso.liveServerStatus.update.enabled)
                    continue;

                else
                {
                    dClient.libs.fs.readJson(dClient.libs.join(baseGuildPath, "liveServerUpdate", "savedVariables.json")).then(function(liveVars)
                    {
                        // live panel
                        if (guild.config.eso.liveServerStatus.panel.enabled)
                        {
                            let liveChannel = guild.channels.get(guild.config.eso.liveServerStatus.panel.channel);

                            // if liveChannel was deleted in between calls
                            if (!liveChannel)
                                return;

                            liveChannel.messages.fetch(liveVars.panelId)
                                .then(function(panelMessage)
                                {
                                    panelMessage.edit({ embed: finalPanelEmbed }).catch(dClient.modules.utils.consoleError);
                                }).catch(function()
                                {
                                    liveChannel.send({ embed: finalPanelEmbed })
                                        .then(function(sentMessage)
                                        {
                                            liveVars.panelId = sentMessage.id;
                                            dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), liveVars).catch(dClient.modules.utils.consoleError);
                                        }).catch(dClient.modules.utils.consoleError);
                                });
                        }

                        // global announcements
                        if (guild.config.eso.liveServerStatus.update.enabled)
                        {
                            if (changedServers.length)
                            {
                                let updateChannel = guild.channels.get(guild.config.eso.liveServerStatus.update.channel)
                                , roles = guild.config.eso.liveServerStatus.update.roles.map(x => guild.roles.get(x));

                                // if updateChannel was deleted in between calls
                                if (!updateChannel)
                                    return;

                                dClient.modules.utils.toggleRoles(guild.config.eso.liveServerStatus.update.toggleRoles, roles.filter(r => !r.mentionable)).then(function(modifiedRoles)
                                {
                                    deletePreviousUpdate(guild.config.eso.liveServerStatus.update.deletePrevious, updateChannel, liveVars.updateId).then(function(deletedMessage)
                                    {
                                        updateChannel.send(roles.map(r => r.toString()).join(" "), { embed: finalUpdateEmbed })
                                            .then(function(sentMessage)
                                            {
                                                dClient.modules.utils.toggleRoles(guild.config.eso.liveServerStatus.update.toggleRoles, roles).catch(dClient.modules.utils.consoleError);
                                                liveVars.updateId = sentMessage.id;
                                                dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), liveVars).catch(dClient.modules.utils.consoleError);
                                            }).catch(dClient.modules.utils.consoleError);
                                    }).catch(dClient.modules.utils.consoleError);
                                }).catch(dClient.modules.utils.consoleError);
                            }
                        }
                    }).catch(dClient.modules.utils.consoleError);
                }
            }
        }).catch(dClient.modules.utils.consoleError);
    }).catch(dClient.modules.utils.consoleError);
}

module.exports = function()
{
    liveServerStatus();
};

module.exports.about = {
    name: "liveServerStatus",
    description: "Fetches updates regarding Status for ESO Servers."
}
module.exports.alias = [];
module.exports.args = {};
module.exports.userPermissions = 10000;
module.exports.example = "";
module.exports.function = liveServerStatus;
