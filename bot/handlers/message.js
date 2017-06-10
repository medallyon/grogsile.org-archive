// "message" event, taking 1 parameter: message
dClient.on("message", function (msg) {
    // this variable holds the time it was received
    msg["performance"] = Date.now();

    /**
     * today = {Object} Date
     * consoleOutput = {String} "[Formatted Timestamp] + [Author]: [Message Content] + [Message Location]"
     * msg.command = {String} "[Command]"
     * msg.args = {Array} [Command Arguments]
    **/
    let guild = msg.guild
        , today = new Date()
        , consoleOutput = `\n${utils.getFullMonth(today.getUTCMonth()).slice(0, 3)} ${utils.getFullDay(today.getUTCDate())} ${today.getUTCFullYear()} ${String(today.getUTCHours()).length === 1 ? ("0" + today.getUTCHours()) : today.getUTCHours()}:${String(today.getUTCMinutes()).length === 1 ? ("0" + today.getUTCMinutes()) : today.getUTCMinutes()}:${String(today.getUTCSeconds()).length === 1 ? ("0" + today.getUTCSeconds()) : today.getUTCSeconds()} UTC\n${(msg.author.id === dClient.user.id ? "[YOU] " : "")}@${msg.author.username}: "${(msg.content.length > 0) ? msg.content : ((msg.attachments.size > 0) ? "[Attachment]" : "[Embed]")}"\n${msg.guild ? (msg.guild.name + " - [" + msg.channel.name + "]") : (`[@${msg.channel.recipient.username}]`)}`
        , splitMsg = msg.content.split(" ");

    // log the formatted message
    console.log(consoleOutput);

    // return on bot message - we don't want to interfere with other bots
    if (msg.author.bot) return;

    // check whether user is using command prefix or mention to execute a command, and assign them to 'msg' accordingly
    if (msg.mentions.users.has(dClient.user.id) && splitMsg[0].includes(dClient.user.id) && splitMsg.length > 1) {
        msg.command = splitMsg[1].toLowerCase();
        msg.args = splitMsg.slice(2);
    } else

    if (splitMsg[0].startsWith(dClient.config.discord.prefix)) {
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
                    // check if the member actually has permission to execute the command
                    if (utils.hasPermission(dClient.commands[cmd], msg.member))
                    {
                        try {
                            // execute the command module
                            return modules[cmd](msg);
                        } catch (err) {
                            // catch an error in case the command module is faulty
                            console.error(err);
                            msg.channel.send(`\`\`\`js\n${err}\`\`\``);
                        }
                    }
                }
            }
        }
    } else

    if (/\[.+\]/g.test(msg.content))
    {
        let requestedItem = /\[(.+)\]/g.exec(msg.content)[1];
        modules.esoItem(msg, requestedItem);
    }
});
