const Discord = require("discord.js");

function constructHelpFor(perm)
{
    let h = new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor("Commands", dClient.user.avatarURL)
        .setDescription("Here is a list of commands that **You** have access to. To see what more commands there are, visit the [Grogsile Hub](This is still a work in progress.) You can inspect each command by passing their name to the `help` command (see example below).")
        .setFooter("Brought to you by Grogsile, Inc.", "https://i.grogsile.me/img/favicon.png")
        .setTimestamp(new Date());

    for (let cmd in dClient.commands) {
        if (perm >= dClient.commands[cmd].userPermissions) h.addField(cmd, dClient.commands[cmd].description, true);
    }
    h.addField("Example Usage", `\`\`\`fix\n${dClient.config.discord.prefix}help [command]\`\`\``);

    return h;
}

function help(msg)
{
    let e;
    if (msg.args.length === 0)
    {
        e = constructHelpFor(utils.determinePermissions(msg.member));
    } else

    // if developer+ simulates a user's permissions
    if (/^\d+/g.test(msg.args[0]) && utils.determinePermissions(msg.member) >= 900)
    {
        if (["100", "200", "300", "400", "900", "1000"].some(x => x === msg.args[0])) e = constructHelpFor(msg.args[0]);
        else e = constructHelpFor(utils.determinePermissions(msg.member));
    }

    // help embed for individual commands
    else
    {
        e = new Discord.RichEmbed()
            .setColor(utils.randColor())
            .setAuthor("Commands", dClient.user.avatarURL)
            .setFooter("Brought to you by Grogsile, Inc.", "https://i.grogsile.me/favicon.png")
            .setTimestamp(new Date());

        let command;
        for (let cmd in dClient.commands) {
            if (dClient.commands[cmd].alias.some(a => a === msg.args[0].toLowerCase()))
            {
                command = dClient.commands[cmd];
                command.name = cmd;
                break;
            }
        }

        if (!command || !utils.hasPermission(dClient.commands[command.name], msg.member))
        {
            msg.args = [];
            return help(msg);
        }

        e.setTitle(command.name);
        e.setDescription(command.description);

        e.addField("Aliases", command.alias.join(", "));
        for (let arg in command.arguments) {
            e.addField(arg + ((command.arguments[arg].optional) ? "" : "*"), command.arguments[arg].description);
        }
        e.addField("Example Usage", `\`\`\`fix\n${dClient.config.discord.prefix}${command.alias[0]} ${command.example}\`\`\``);
    }

    return msg.channel.sendEmbed(e).catch(console.error);
}

module.exports = help;