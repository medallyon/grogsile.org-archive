// === [ LIBRARIES ] === //

global.Discord = require("discord.js");
global.fs = require("fs-extra");
global.path = require("path");
global.join = path.join;
global.dateFormat = require("dateformat");

// === [ GLOBALS ] === //

// ./
global.__base = __dirname;
// ./data/
global.__data = join(__dirname, "data");
// ./web/.pub_src/
global.__src = join(__dirname, "web", ".pub_src");

// ./web/
global.__webdir = join(__dirname, "web");
// ./bot/
global.__botdir = join(__dirname, "bot");

// a global object containing re-usable templates for files that need to be saved during runtime
global._templates = {};
let templateFiles = fs.readdirSync(join(__data, "templates"));
for (let i = 0; i < templateFiles.length; i++) {
    _templates[templateFiles[i].replace(".json", "")] = fs.readJsonSync(join(__data, "templates", templateFiles[i]));
}

// import global utils
global.utils = { implementReload: require(join(__dirname, "utils", "implementReload.js")) };
for (let file of fs.readdirSync(join(__dirname, "utils")))
{
    let scriptPath = join(__dirname, "utils", file)
    , scriptName = file.replace(".js", "");

    utils[scriptName] = require(scriptPath);
    utils[scriptName].reload = utils.implementReload(scriptName, scriptPath, utils);
}

// a global object containing re-usable process-wide constants
global.constants = require(join(__dirname, "constants", "constants.json"));
// a script to add / alter pre-existing constants that may only be alter-able during runtime (circular objects)
require(join(__dirname, "constants", "constants.js"));

// === [ IMPORTS ] === //

// initialize the BOT partition
require(join(__botdir, "bot.js"));
// initialize the WEB partition
require(join(__webdir, "web.js"));
