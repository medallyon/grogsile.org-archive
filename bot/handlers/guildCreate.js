dClient.on("guildCreate", (guild) => {
    let guildConfig = _templates.guild;
    
    guildConfig.id = guild.id;

    let newsChannel = (guild.channels.exists("name", "announcements")) ? guild.channels.find("name", "announcements") : guild.defaultChannel;
    guildConfig.eso.news.channel = newsChannel.id;
    guildConfig.eso.youtube.channel = newsChannel.id;

    fs.outputJson(join(__data, "guilds", guild.id, "config.json"), guildConfig, (err) => { if (err) console.error(err) });
    fs.outputJson(join(__data, "guilds", guild.id, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }, (err) => { if (err) console.error(err) });
    fs.outputJson(join(__data, "guilds", guild.id, "RSS", "savedVariables.json"), { latest: 0 }, (err) => { if (err) console.error(err) });
});
