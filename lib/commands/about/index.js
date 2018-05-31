const Discord = require("discord.js");

function createEmbed()
{
    return new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor(dClient.user.username, dClient.user.displayAvatarURL(), "https://bot.grogsile.org/")
        .setDescription(`The Tamriel Messenger is a Discord Bot for fans of the Elder Scrolls series, especially TES: Online. With this bot, you will be able to easily integrate your whole ESO experience within Discord. See \`${dClient.config.bot.discord.prefix}commands\` for a list of commands.`)
        .addField("Creator", "<@129036763367735297>")
        .addField("\u200B", "**Information**")
        .addField("Website", "[Learn about this Robot](https://bot.grogsile.org/)")
        .addField("Grogsile Developer Hub", "[Join our Discord for latest updates](http://discord.gg/eKSPgvF/)", true)
        .addField("Patreon", "[Support us on Patreon!](https://patreon.com/medallyon/)", true)
        .addField("\u200B", "**Statistics**")
        .addField("Uptime", dClient.modules.utils.timeSince(Date.now() - dClient.uptime))
        .addField("Guilds", dClient.guilds.size, true)
        .addField("Total Users", dClient.users.size, true);
}

function about(msg)
{
    if (!msg.args.length)
        return msg.channel.send({ embed: createEmbed() }).catch(dClient.modules.utils.consoleError);
    else
        return dClient.modules.commands.commands(msg);
}

module.exports = function(msg)
{
    about(msg);
};

module.exports.about = {
    name: "about",
    description: "Shows the `about` panel."
}
module.exports.alias = [
    "about",
    "info",
    "help"
];
module.exports.args = {};
module.exports.userPermissions = 100;
module.exports.example = "";
module.exports.function = about;
