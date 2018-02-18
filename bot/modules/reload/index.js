const decache = require("decache");

function reload(msg)
{
    if (msg.args.length === 2)
    {
        let group = msg.args[0];
        let script = msg.args[1];

        if (group.toLowerCase().includes("module"))
        {
            if (dClient.modules[script])
            {
                try
                {
                    dClient.modules[script].reload();
                    msg.channel.send(`Successfully reloaded \`${script}.js\``).catch(console.error);
                }

                catch (err)
                {
                    console.log(err);
                    msg.channel.send(`Something went wrong while reloading this script. Have a look at this: \`\`\`js\n${err}\`\`\``).catch(console.error);
                }
            } else msg.channel.send("Script not found. Ensure case-sensitivity.").catch(console.error);
        } else

        if (group.toLowerCase().includes("util"))
        {
            if (utils[script])
            {
                try
                {
                    utils[script].reload();
                    msg.channel.send(`Successfully reloaded \`${script}.js\``).catch(console.error);
                }

                catch (err)
                {
                    console.log(err);
                    msg.channel.send(`Something went wrong while reloading this script. Have a look at this: \`\`\`js\n${err}\`\`\``).catch(console.error);
                }
            } else msg.channel.send("Script not found. Ensure case-sensitivity.").catch(console.error);
        } else

        if (group.toLowerCase().includes("struct"))
        {
            if (dClient.structs[script])
            {
                try
                {
                    dClient.structs[script].reload();
                    msg.channel.send(`Successfully reloaded \`${script}.js\``).catch(console.error);
                }

                catch (err)
                {
                    console.log(err);
                    msg.channel.send(`Something went wrong while reloading this script. Have a look at this: \`\`\`js\n${err}\`\`\``).catch(console.error);
                }
            } else msg.channel.send("Script not found. Ensure case-sensitivity.").catch(console.error);
        } else

        if (group.toLowerCase().includes("handler") || group.toLowerCase().includes("listener"))
        {
            fs.readdir(join(__botdir, "handlers"), function(err, files)
            {
                if (err)
                {
                    msg.channel.send(`There was an error. Have a look at this:\`\`\`js\n${err}\`\`\``).catch(console.error);
                    return console.error(err);
                }

                let eventName = script;
                if (files.map(x => x.replace(".js", "")).includes(eventName) && eventName !== "esoi")
                {
                    let handlerPath = join(__botdir, "handlers", `${eventName}.js`);
                    try
                    {
                        dClient.removeListener(eventName, require(handlerPath));
                        decache(handlerPath);

                        dClient.addListener(eventName, require(handlerPath));

                        msg.channel.send(`Successfully reloaded \`${eventName}.js\``).catch(console.error);
                    } catch (err)
                    {
                        console.log(err);
                        msg.channel.send(`Something went wrong while reloading this event. Have a look at this: \`\`\`js\n${err}\`\`\``).catch(console.error);
                    }
                } else

                if (group.toLowerCase().includes("/esoi"))
                {
                    fs.readdir(join(__botdir, "handlers", "esoi"), function(err, esoiFiles)
                    {
                        if (err)
                        {
                            msg.channel.send(`There was an error. Have a look at this:\`\`\`js\n${err}\`\`\``).catch(console.error);
                            return console.error(err);
                        }

                        if (esoiFiles.map(x => x.replace(".js", "")).includes(eventName))
                        {
                            let handlerPath = join(__botdir, "handlers", "esoi", `${eventName}.js`);
                            try
                            {
                                dClient.removeListener(eventName, require(handlerPath));
                                decache(handlerPath);

                                dClient.addListener(eventName, require(handlerPath));

                                msg.channel.send(`Successfully reloaded \`${eventName}.js\``).catch(console.error);
                            } catch (err)
                            {
                                console.log(err);
                                msg.channel.send(`Something went wrong while reloading this event. Have a look at this: \`\`\`js\n${err}\`\`\``).catch(console.error);
                            }
                        } else msg.channel.send("Script not found. Ensure case-sensitivity.").catch(console.error);
                    });
                } else msg.channel.send("Script not found. Ensure case-sensitivity.").catch(console.error);
            });
        }

        else msg.channel.send("Specified Script Group not found.").catch(console.error);
    } else

    if (msg.args.length === 1)
    {
        let group = msg.args[0];

        if (group.toLowerCase() === "modules")
        {
            try
            {
                for (const module of dClient.modules) module.reload();
            } catch (err)
            {
                console.log(err);
                msg.channel.send(`Something went wrong while reloading this Script Group. Have a look at this: \`\`\`js\n${err}\`\`\``).then(process.exit).catch(console.error);
            }
        } else

        if (group.toLowerCase() === "utils")
        {
            try
            {
                for (const util of utils) util.reload();
            } catch (err)
            {
                console.log(err);
                msg.channel.send(`Something went wrong while reloading this Script Group. Have a look at this: \`\`\`js\n${err}\`\`\``).then(process.exit).catch(console.error);
            }
        } else

        if (group.toLowerCase() === "structs")
        {
            try
            {
                for (const struct of dClient.structs) struct.reload();
            } catch (err)
            {
                console.log(err);
                msg.channel.send(`Something went wrong while reloading this Script Group. Have a look at this: \`\`\`js\n${err}\`\`\``).then(process.exit).catch(console.error);
            }
        } else

        if (group.toLowerCase() === "handlers")
        {
            msg.channel.send("**Error 501**: Not yet Implemented.").catch(console.error);
        } else

        if (group.toLowerCase() === "bot")
        {
            try
            {
                for (const module of dClient.modules) module.reload();
                for (const struct of dClient.structs) struct.reload();
            } catch (err)
            {
                console.log(err);
                msg.channel.send(`Something went wrong while reloading this Script Group. Have a look at this: \`\`\`js\n${err}\`\`\``).then(process.exit).catch(console.error);
            }
        } else

        if (group.toLowerCase() === "web")
        {
            msg.channel.send("Reloading of the Web partition is not yet featured. Check back later.").catch(console.error);
        }

        else msg.channel.send("Specified Script Group not found.").catch(console.error);
    }

    else msg.channel.send("That's not how this works. That's not how any of this works!").catch(console.error);
}

module.exports = reload;
