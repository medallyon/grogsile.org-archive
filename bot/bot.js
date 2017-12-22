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
    let scriptPath = join(__dirname, "modules", file, "index.js");

    dClient.modules[file] = require(scriptPath);
    dClient.modules[file].reload = utils.implementReload(file, scriptPath, dClient.modules);
}

// import custom structures
dClient.structs = {};
for (let file of fs.readdirSync(join(__dirname, "structs")))
{
    let scriptPath = join(__dirname, "structs", file)
    , scriptName = file.replace(".js", "");

    dClient.structs[scriptName] = require(scriptPath);
    dClient.structs[scriptName].reload = utils.implementReload(scriptName, scriptPath, dClient.structs);
}

if (!dClient.config.reloading)
{
    // import Discord event handlers
    for (let file of fs.readdirSync(join(__dirname, "handlers")).filter(x => x !== "esoi"))
    {
        require(join(__dirname, "handlers", file));
    }

    // log in to Discord using the Discord BOT token
    dClient.login(dClient.config.discord.token)
        .catch(console.error);
}
