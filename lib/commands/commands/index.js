const Discord = require("discord.js");

function constructHelpFor(perm)
{
    let h = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor("Commands", dClient.user.avatarURL)
        .setDescription("Here is a list of commands that **You** have access to. To see what more commands there are, visit the [Grogsile Hub](https://bot.grogsile.org/) You can inspect each command by passing their name to the `help` command (see example below).");

    for (const cmd in dClient.modules.commands)
    {
        if (perm >= dClient.modules.commands[cmd].userPermissions && dClient.modules.commands[cmd].userPermissions !== 10000)
            h.addField(cmd, dClient.modules.commands[cmd].about, true);
    }

    h.addField("Example Usage", `\`\`\`fix\n${dClient.config.bot.discord.prefix}commands [command]\`\`\``);

    return h;
}

function commands(msg)
{
    let embed;
    if (msg.args.length === 0)
        embed = constructHelpFor(dClient.modules.utils.determinePermissions(msg.member));
    
    // if developer+ simulates a user's permissions
    else if (/^\d+/g.test(msg.args[0]) && dClient.modules.utils.determinePermissions(msg.member) >= 900)
    {
        if (["100", "200", "300", "400", "900", "1000"].some(x => x === msg.args[0]))
            embed = constructHelpFor(msg.args[0]);
        else
            embed = constructHelpFor(dClient.modules.utils.determinePermissions(msg.member));
    }

    // help embed for individual commands
    else
    {
        embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
            .setAuthor("Commands", dClient.user.avatarURL);

        let command;
        for (const cmd in dClient.modules.commands) {
            if (dClient.modules.commands[cmd].alias.some(a => a === msg.args[0].toLowerCase()))
            {
                command = dClient.modules.commands[cmd];
                break;
            }
        }

        if (!command || !dClient.modules.utils.hasPermission(dClient.modules.commands[command.name], msg.member))
        {
            msg.args = [];
            return commands(msg);
        }

        embed.setTitle(command.name);
        embed.setDescription(command.description);
        embed.addField("Aliases", command.alias.join(", "));

        for (const arg in command.arguments)
            embed.addField(arg + ((command.arguments[arg].optional) ? "" : "*"), command.arguments[arg].description);

        embed.addField("Example Usage", `\`\`\`fix\n${dClient.config.bot.discord.prefix}${command.alias[0]} ${command.example}\`\`\``);
    }

    return msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
}

module.exports = function(msg)
{
    commands(msg);
};

module.exports.name = "commands";
module.exports.about = "Displays some help with commands.";
module.exports.alias = [
    "commands",
    "command",
    "man"
];
module.exports.arguments = {
    command: {
        description: "The target command for which help should be displayed.",
        optional: true
    }
};
module.exports.userPermissions = 100;
module.exports.example = "ping";
module.exports.function = commands;
