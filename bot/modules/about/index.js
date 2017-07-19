function createEmbed()
{
    return new Discord.RichEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor(dClient.user.username, dClient.user.avatarURL, "https://esoi.grogsile.me/")
        .setDescription(`The Tamriel Messenger is a Discord Bot catered to fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord. See \`${dClient.config.discord.prefix}help\` for further assistance.`)
        .addField("Website", "[Grogsile Inc.](https://esoi.grogsile.me/)", true)
        .addField("Creator", "@Medallyon#5012", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", utils.timeSince(dClient.uptime))
        .addField("Guilds", dClient.guilds.size, true)
        .addField("Users", dClient.users.size, true);
}

function about(msg)
{
    msg.channel.send({ embed: createEmbed() }).catch(console.error);
}

module.exports = about;
