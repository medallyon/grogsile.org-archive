const Discord = require("discord.js");

function about(msg)
{
    msg.channel.sendEmbed(new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(dClient.user.username, dClient.user.avatarURL, "https://grogsile.me/")
        .setDescription("I'm just a horse. Don't mind me.")
        .addField("About", "The Tamriel Messenger is a Discord Bot catered to fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord.", true)
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
