function prepareBaseGuildFiles(guild)
{
    const baseGuildPath = dClient.libs.join(__data, "guilds", guild.id);

    dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }).catch(console.error);
    dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "RSS", "savedVariables.json"), { latest: 0 }).catch(console.error);
    dClient.libs.fs.outputJson(dClient.libs.join(baseGuildPath, "liveServerUpdate", "savedVariables.json"), { panelId: "0", updateId: "0" }).catch(console.error);
}

module.exports = prepareBaseGuildFiles;
