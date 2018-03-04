function guildCreate(guild)
{
    guild.config = dClient.config.templates.guild;
    guild.config.id = guild.id;

    guild.config = dClient.modules.utils.treatConfig(guild, guild.config);
    guild.config._save().catch(console.error);

    const baseGuildPath = dClient.libs.join(__data, "guilds", guild.id);

    dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "welcomeMessage", "savedVariables.json"), { latestMembers: [] })
        .then(function()
        {
            dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "RSS", "savedVariables.json"), { latest: 0 })
                .then(function()
                {
                    dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), { panelId: "0", updateId: "0" }).catch(console.error);
                }).catch(console.error);
        }).catch(console.error);

    // dClient.modules.utils.postServerCountToAPI(dClient.constants.apiURLs);
}

module.exports = guildCreate;
