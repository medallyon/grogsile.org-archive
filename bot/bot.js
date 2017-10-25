// === [ DISCORD ] === //

if (typeof dClient === "undefined")
{
    let client = new Discord.Client();
    global.dClient = client;

    dClient.config = fs.readJsonSync(join(__dirname, "config.json"));
    dClient.commands = fs.readJsonSync(join(__dirname, "commands.json"));
    dClient.eso = {};
}

// === [ MODULE IMPORTS ] === //

// import command modules
dClient.modules = {};
for (let file of fs.readdirSync(join(__dirname, "modules")))
{
    dClient.modules[file] = require(join(__dirname, "modules", file, "index.js"));
}

// import custom structures
dClient.structs = {};
for (let file of fs.readdirSync(join(__dirname, "structs")))
{
    dClient.structs[file.replace(".js", "")] = require(join(__dirname, "structs", file));
}

if (!dClient.config.reloading)
{
    // import Discord event handlers
    for (let file of fs.readdirSync(join(__dirname, "handlers")))
    {
        require(join(__dirname, "handlers", file));
    }
}

if (!dClient.config.reloading)
{
    // log in to Discord using the Discord BOT token
    dClient.login(dClient.config.discord.token)
        .catch(console.error);
}
