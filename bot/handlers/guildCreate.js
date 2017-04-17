const fs = require("fs-extra")
, join = require("path").join;

const templates = {
    guild: require(join(__data, "templates", "guild.json"))
};

dClient.on("guildCreate", (guild) => {
    let guildConfig = templates.guild;
    
    guildConfig.id = guild.id;

    let newsChannel = (guild.channels.exists("name", "announcements")) ? guild.channels.find("name", "announcements") : guild.defaultChannel;
    guildConfig.eso.news.channel = newsChannel.id;
    guildConfig.eso.youtube.channel = newsChannel.id;

    fs.outputJson(join(__data, "guilds", guild.id, "config.json"), guildConfig, (err) => { if (err) console.error(err) });
    fs.outputJson(join(__data, "guilds", guild.id, "welcomeMessage", "savedVariables.json"), { latestMembers: [] }, (err) => { if (err) console.error(err) });
});
