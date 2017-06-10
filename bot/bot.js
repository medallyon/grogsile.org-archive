// === [ LIBRARIES ] === //

// a global object containing re-usable process-wide constants
global.constants = require(join(__dirname, "constants", "constants.json"));
// a script to add / alter pre-existing constants that may only be alter-able during runtime (circular objects)
require(join(__dirname, "constants", "constants.js"));

// === [ DISCORD ] === //

if (typeof dClient === "undefined")
{
    let client = new Discord.Client();
    global.dClient = client;

    dClient.config = fs.readJsonSync(join(__dirname, "config.json"));
    dClient.commands = fs.readJsonSync(join(__dirname, "commands.json"));
}

// === [ MODULE IMPORTS ] === //

// import global utils
global.utils = {};
for (let file of fs.readdirSync(join(__dirname, "utils")))
{
    utils[file.replace(".js", "")] = require(join(__dirname, "utils", file));
}

// import command modules
global.modules = {};
for (let file of fs.readdirSync(join(__dirname, "modules")))
{
    modules[file] = require(join(__dirname, "modules", file, "index.js"));
}

// import custom structures
global.structs = {};
for (let file of fs.readdirSync(join(__dirname, "structs")))
{
    structs[file.replace(".js", "")] = require(join(__dirname, "structs", file));
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
