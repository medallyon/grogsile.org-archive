var Discord = require("discord.js");

function help(msg)
{
    let h = new Discord.RichEmbed();

    h.setColor(utils.randColor());
    h.setAuthor("Commands", dClient.user.avatarURL);
    h.setFooter("Brought to you by Grogsile Industries Inc.", "https://i.grogsile.me/img/favicon.png");
    h.setTimestamp(new Date());

    if (msg.args.length === 0) {
        h.setDescription("Here is a list of commands that **You** have access to. To see what more commands there are, visit the [Grogsile Hub](This is still a work in progress.) You can inspect each command by passing their name to the `help` command (see example below).");

        for (let cmd in dClient.commands) {
            if (utils.hasPermission(dClient.commands[cmd], msg.member)) h.addField(cmd, dClient.commands[cmd].description, true);
        }
        h.addField("Example Usage", `\`\`\`fix\n${dClient.config.discord.prefix}help [command]\`\`\``);
    }

    else {
        let command;
        for (let cmd in dClient.commands) {
            if (dClient.commands[cmd].alias.some(a => a === msg.args[0].toLowerCase())) {
                command = dClient.commands[cmd];
                command.name = cmd;
                break;
            }
        }

        if (!command || !utils.hasPermission(dClient.commands[command.name], msg.member)) {
            msg.args = [];
            return help(msg);
        }

        h.setTitle(command.name);
        h.setDescription(command.description);

        h.addField("Aliases", command.alias.join(", "));
        for (let arg in command.arguments) {
            h.addField(arg + ((command.arguments[arg].optional) ? "" : "*"), command.arguments[arg].description);
        }
        h.addField("Example Usage", `\`\`\`fix\n${dClient.config.discord.prefix}${command.alias[0]} ${command.example}\`\`\``);
    }

    return msg.channel.sendEmbed(h).catch(console.error);
}

module.exports = help;
