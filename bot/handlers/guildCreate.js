function prepareFiles(guild)
{
    const baseGuildPath = join(__data, "guilds", guild.id);

    fs.outputJson(join(baseGuildPath, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }).catch(console.error);
    fs.outputJson(join(baseGuildPath, "RSS", "savedVariables.json"), { latest: 0 }).catch(console.error);
    fs.outputJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), { panelId: "0", updateId: "0" }).catch(console.error);
}

dClient.on("guildCreate", function(guild)
{
    guild.config = _templates.guild;
    guild.config.id = guild.id;

    guild.config = treatConfig(guild, guild.config);
    guild.config.save();

    prepareFiles(guild);
});
