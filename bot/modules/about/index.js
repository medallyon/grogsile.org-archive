function createEmbed()
{
    return new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
        .setAuthor(dClient.user.username, dClient.user.displayAvatarURL(), "")
        .setDescription(`The Tamriel Messenger is a Discord Bot catered to fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord. See \`${dClient.config.discord.prefix}help\` for further assistance.`)
        .addField("Creator", "@Medallyon#5012", true)
        .addField("ESO International", "[Hub](https://esoi.grogsile.org/) - Manage your Guilds and Characters here", true)
        .addField("Join the Dev. Hub", "[Grogsile Inc. Dev Hub](http://discord.gg/eKSPgvF)", true)
        .addField("Patreon", "[Support us on Patreon!](https://patreon.com/medallyon/)", true)
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
