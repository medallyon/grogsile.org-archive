// "message" event, taking 1 parameter: message
function message(msg)
{
    // wait for `client` done loading
    if (!dClient.loaded) return;

    // this variable holds the time it was received
    msg["performance"] = Date.now();

    let now = new Date();
    const timeOut = `${dClient.modules.utils.getFullMonth(now.getUTCMonth()).slice(0, 3)} ${dClient.modules.utils.getFullDay(now.getUTCDate())} ${now.getUTCFullYear()} ${String(now.getUTCHours()).length === 1 ? ("0" + now.getUTCHours()) : now.getUTCHours()}:${String(now.getUTCMinutes()).length === 1 ? ("0" + now.getUTCMinutes()) : now.getUTCMinutes()}:${String(now.getUTCSeconds()).length === 1 ? ("0" + now.getUTCSeconds()) : now.getUTCSeconds()} UTC`
    , messageOut = `${(msg.author.id === dClient.user.id ? "[YOU] " : "")}@${msg.author.username}: "${(msg.content.length > 0) ? msg.content : ((msg.attachments.size > 0) ? "[Attachment]" : "[Embed]")}"`
    , targetOut = `${msg.guild ? ("#" + msg.channel.name + " - [" + msg.guild.name + "]") : (`[@${msg.channel.recipient.username}]`)}`;

    // log the formatted message
    console.log("\n" + timeOut + "\n" + messageOut + "\n" + targetOut);

    // return on bot message - we don't want to interfere with other bots
    if (msg.author.bot) return;

    // do not support direct messages yet
    if (!msg.guild) return msg.channel.send("Mighty Sorry, but direct messages are not supported yet.").catch(console.error);

    // don't check commands in blacklisted channels
    if (msg.guild.config.guild.restricted.some(x => x === msg.channel.id)) return;

    let splitMsg = msg.content.split(" ");
    // check whether user is using command prefix or mention to execute a command, and assign them to 'msg' accordingly
    if (msg.mentions.users.has(dClient.user.id) && splitMsg[0].includes(dClient.user.id) && splitMsg.length > 1)
    {
        msg.command = splitMsg[1].toLowerCase();
        msg.args = splitMsg.slice(2);
    } else

    if (splitMsg[0].startsWith(dClient.config.bot.discord.prefix))
    {
        msg.command = splitMsg[0].slice(dClient.config.bot.discord.prefix.length).toLowerCase();
        msg.args = splitMsg.slice(1);
    }

    // establish a command handler for
    // every command in the commands.json

    // check if the command prefix exists
    if (msg.command)
    {
        // iterate through all commands
        for (let cmd in dClient.commands)
        {
            // for every alias of the current command
            for (let alias of dClient.commands[cmd].alias)
            {
                // check if some alias matches the filtered command string
                if (msg.command === alias)
                {
                    // check if command is enabled for this guild
                    let commands = msg.guild.config.guild.commands;
                    if (commands[cmd].enabled)
                    {
                        // check if the member actually has permission to execute the command
                        if (dClient.modules.utils.hasPermission(dClient.commands[cmd], msg.member))
                        {
                            try
                            {
                                // execute the command module
                                dClient.modules.commands[cmd](msg);
                            } catch (err)
                            {
                                // catch an error in case the command module is faulty
                                console.error(err);
                                msg.channel.send(err.message, { code: "js" });
                            }

                            // amend statistics
                            dClient.libs.fs.readJson(dClient.libs.join(__data, "statistics.json")).then(function(stats)
                            {
                                if (!stats.commands.hasOwnProperty(cmd)) stats.commands[cmd] = 1;
                                stats.commands[cmd]++;

                                dClient.libs.fs.outputJson(dClient.libs.join(__data, "statistics.json"), stats).catch(console.error);
                            }).catch(console.error);
                        }
                    }
                }
            }
        }
    } else

    if (/\[.+\]/g.test(msg.content) && !/`.*?\[.+\].*?`/g.test(msg.content))
    {
        let config = msg.guild.config;
        if (!config.guild.commands.esoItem.enabled || !config.guild.commands.esoItem.usage.inline) return;

        let requestedItem = /\[(.+)\]/g.exec(msg.content)[1];
        if (requestedItem.length < 2) return;

        dClient.modules.esoItem(msg, requestedItem);

        // amend statistics
        dClient.libs.fs.readJson(dClient.libs.join(__data, "statistics.json")).then(function(stats)
        {
            if (!stats.commands.hasOwnProperty("esoItem_inline")) stats.commands["esoItem_inline"] = 1;
            stats.commands["esoItem_inline"]++;

            dClient.libs.fs.outputJson(dClient.libs.join(__data, "statistics.json"), stats).catch(console.error);
        }).catch(console.error);
    }
}

module.exports = message;
