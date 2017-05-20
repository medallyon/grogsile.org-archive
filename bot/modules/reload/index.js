const fs = require("fs-extra")
, path = require("path")
, join = path.join
, decache = require("decache");

function reloadBot(msg)
{
    try
    {
        decache(join(__botdir, "bot.js"));

        for (let util in utils)
        {
            decache(join(__botdir, "utils", `${util}.js`));
        }
        global.utils = {};

        for (let module in modules)
        {
            decache(join(__botdir, "modules", module, "index.js"));
        }
        global.modules = {};

        require(join(__botdir, "bot.js"));
        dClient.config.reloading = false;

        fs.outputJson(join(__botdir, "config.json"), dClient.config);

        msg.channel.send(":white_check_mark: Successfully reloaded the **Bot** partition.");
    }

    catch(err)
    {
        dClient.config.reloading = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config);
        msg.channel.send(`:negative_squared_cross_mark: Could not reload the Bot partition:\`\`\`js\n${err}\`\`\``);
    }
}

function reloadWeb(msg)
{
    try
    {
        global.server.close();
        decache(join(__webdir, "web.js"));

        for (let script in middleware)
        {
            decache(join(__webdir, "middleware", script, `${script}.js`));
        }
        global.middleware = {};

        fs.readdir(join(__webdir, "routers"), (err, routers) => {
            if (err) return process.exit(1);

            for (let router in routers)
            {
                decache(join(__webdir, "routers", router, router));
            }
        });

        require(join(__webdir, "web.js"));
        dClient.config.reloading = false;

        fs.outputJson(join(__botdir, "config.json"), dClient.config);

        msg.channel.send(":white_check_mark: Successfully reloaded the **Web** partition.");
    }

    catch(err)
    {
        dClient.config.reloading = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config);
        msg.channel.send(`:negative_squared_cross_mark: Could not reload the Web partition:\`\`\`js\n${err}\`\`\``);
    }
}
        

function reload(msg)
{
    let partition;
    if (msg.args.length) partition = msg.args[0].toLowerCase();

    dClient.config.reloading = true;
    fs.outputJson(join(__botdir, "config.json"), dClient.config, (err) => {
        if (err) return console.error(err);

        if (!partition)
        {
            reloadBot();
            reloadWeb();
        }

        else
        {
            if (!["web", "bot"].some(p => partition === p)) return msg.channel.send("Specified partition is not recognised.");

            if (partition === "bot") reloadBot(msg);
            else if (partition === "web") reloadWeb(msg);
        }
    });
}

module.exports = reload;