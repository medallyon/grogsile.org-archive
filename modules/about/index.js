const Discord = require("discord.js");

function about(msg)
{
    msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(dClient.user.username, dClient.user.avatarURL, "https://grogsile.me/")
        .setDescription("I'm just a horse. Don't mind me.")
        .addField("About", "some paragraph about this bot", true)
        .addField("Website", "[Grogsile Inc.](https://esoi.grogsile.me/)", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", utils.getUptimeString(dClient.uptime), true)
        .addField("Guilds", dClient.guilds.size, true)
        .addField("Users", dClient.users.size, true)
        .setFooter("Brought to you by Grogsile Inc.", "https://i.grogsile.me/img/favicon.png")
        .setTimestamp(new Date().toISOString())
    );
}

module.exports = about;
