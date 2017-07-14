dClient.on("guildCreate", (guild) => {
    curateConfig(_templates.guild, guild);
    prepareFiles(guild);
});

function curateConfig(config, guild)
{
    config.id = guild.id;

    fs.outputJson(join(__data, "guilds", guild.id, "config.json"), config, (err) => { if (err) console.error(err) });
}

function prepareFiles(guild)
{
    const baseGuildPath = join(__data, "guilds", guild.id);

    fs.outputJson(join(baseGuildPath, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }, (err) => { if (err) console.error(err) });
    fs.outputJson(join(baseGuildPath, "RSS", "savedVariables.json"), { latest: 0 }, (err) => { if (err) console.error(err) });
    fs.outputJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), { panelId: "0", updateId: "0" }, (err) => { if (err) console.error(err) });
}
