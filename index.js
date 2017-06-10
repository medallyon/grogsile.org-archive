// === [ LIBRARIES ] === //

const fs = require("fs-extra")
, path = require("path")
, join = path.join;

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

// === [ IMPORTS ] === //

// initialize the BOT partition
require(join(__botdir, "bot.js"));
// initialize the WEB partition
require(join(__webdir, "web.js"));
