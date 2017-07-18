function about(msg)
{
    msg.channel.send({ embed: new Discord.RichEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor(dClient.user.username, dClient.user.avatarURL, "https://esoi.grogsile.me/")
        .setDescription("I'm just a horse. Don't mind me.")
        .addField("About", `The Tamriel Messenger is a Discord Bot catered to fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord. See \`${dClient.config.discord.prefix}help\` for further assistance.`, true)
        .addField("Website", "[Grogsile Inc.](https://esoi.grogsile.me/)", true)
        .addField("Creator", "@Medallyon#5012", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", utils.timeSince(dClient.uptime))
        .addField("Guilds", dClient.guilds.size, true)
        .addField("Users", dClient.users.size, true)
        .setTimestamp(new Date())
    });
}

module.exports = about;
