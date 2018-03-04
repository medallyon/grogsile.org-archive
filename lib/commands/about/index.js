const Discord = require("discord.js");

function createEmbed()
{
    return new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
        .setAuthor(dClient.user.username, dClient.user.displayAvatarURL(), "")
        .setDescription(`The Tamriel Messenger is a Discord Bot for fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord. See \`${dClient.config.bot.discord.prefix}commands\` for a list of commands.`)
        .addField("Creator", "<@129036763367735297>")
        .addField("\u200B", "**Information**")
        .addField("ESO International", "[Join the ESOI Discord Server](https://esoi.grogsile.org/discord/)", true)
        .addField("ESOI Hub", "[Manage your Guilds and Characters here](https://esoi.grogsile.org/)", true)
        .addField("Grogsile, Inc Developer Hub", "[Join our Dev. Hub for latest updates](http://discord.gg/eKSPgvF/)", true)
        .addField("Patreon", "[Support us on Patreon!](https://patreon.com/medallyon/)", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", dClient.modules.utils.timeSince(Date.now() - dClient.uptime))
        .addField("Guilds", dClient.guilds.size, true)
        .addField("Total Users", dClient.users.size, true);
}

function about(msg)
{
    msg.channel.send({ embed: createEmbed() }).catch(console.error);
}

module.exports = about;
