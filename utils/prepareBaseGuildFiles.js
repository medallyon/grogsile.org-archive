function prepareBaseGuildFiles(guild)
{
    const baseGuildPath = join(__data, "guilds", guild.id);

    fs.outputJson(join(baseGuildPath, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }).catch(console.error);
    fs.outputJson(join(baseGuildPath, "RSS", "savedVariables.json"), { latest: 0 }).catch(console.error);
    fs.outputJson(join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), { panelId: "0", updateId: "0" }).catch(console.error);
}

module.exports = prepareBaseGuildFiles;
