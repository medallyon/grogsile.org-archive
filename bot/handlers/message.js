// "message" event, taking 1 parameter: message
dClient.on("message", function (msg) {
    // this variable holds the time it was received
    msg["performance"] = Date.now();

    let now = new Date();
    const timeOut = `${utils.getFullMonth(now.getUTCMonth()).slice(0, 3)} ${utils.getFullDay(now.getUTCDate())} ${now.getUTCFullYear()} ${String(now.getUTCHours()).length === 1 ? ("0" + now.getUTCHours()) : now.getUTCHours()}:${String(now.getUTCMinutes()).length === 1 ? ("0" + now.getUTCMinutes()) : now.getUTCMinutes()}:${String(now.getUTCSeconds()).length === 1 ? ("0" + now.getUTCSeconds()) : now.getUTCSeconds()} UTC`
    , messageOut = `${(msg.author.id === dClient.user.id ? "[YOU] " : "")}@${msg.author.username}: "${(msg.content.length > 0) ? msg.content : ((msg.attachments.size > 0) ? "[Attachment]" : "[Embed]")}"`
    , targetOut = `${msg.guild ? ("#" + msg.channel.name + " - [" + msg.guild.name + "]") : (`[@${msg.channel.recipient.username}]`)}`;

    // log the formatted message
    console.log("\n" + timeOut + "\n" + messageOut + "\n" + targetOut);

    // return on bot message - we don't want to interfere with other bots
    if (msg.author.bot) return;

    // do not support direct messages yet
    if (!msg.guild) return msg.channel.send("Mighty Sorry, but direct messages are not supported yet.").catch(console.error);

    if (msg.guild.config.guild.restricted.some(x => x === msg.channel.id)) return console.info(`Chat is restricted in channel ${msg.channel.id}`);

    let splitMsg = msg.content.split(" ");
    // check whether user is using command prefix or mention to execute a command, and assign them to 'msg' accordingly
    if (msg.mentions.users.has(dClient.user.id) && splitMsg[0].includes(dClient.user.id) && splitMsg.length > 1)
    {
        msg.command = splitMsg[1].toLowerCase();
        msg.args = splitMsg.slice(2);
    } else

    if (splitMsg[0].startsWith(dClient.config.discord.prefix))
    {
        msg.command = splitMsg[0].slice(dClient.config.discord.prefix.length).toLowerCase();
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
                    let config = msg.guild.config;
                    if (config.commands[cmd].enabled)
                    {
                        // check if the member actually has permission to execute the command
                        if (utils.hasPermission(dClient.commands[cmd], msg.member))
                        {
                            try {
                                // execute the command module
                                return dClient.modules[cmd](msg);
                            } catch (err) {
                                // catch an error in case the command module is faulty
                                console.error(err);
                                msg.channel.send(err, { code: "js" });
                            }
                        }
                    }
                }
            }
        }
    } else

    if (/\[.+\]/g.test(msg.content) && !/`.*?\[.+\].*?`/g.test(msg.content))
    {
        let config = msg.guild.config;
        if (!config.commands.esoItem.enabled || !config.commands.esoItem.usage.inline) return;

        let requestedItem = /\[(.+)\]/g.exec(msg.content)[1];
        if (requestedItem.length < 2) return;
        
        dClient.modules.esoItem(msg, requestedItem);
    }
});
