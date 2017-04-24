// === [ LIBRARIES ] === //

const fs = require("fs-extra")
, path = require("path")
, join = path.join;

// === [ GLOBALS ] === //

global.__base = __dirname;
global.__data = path.join(__dirname, "data");
global.__src = path.join(__dirname, "web", ".pub_src");

global.__webdir = path.join(__dirname, "web");
global.__botdir = path.join(__dirname, "bot");

global._templates = {};
let templateFiles = fs.readdirSync(join(__data, "templates"));
for (let i = 0; i < templateFiles.length; i++) {
    _templates[templateFiles[i].replace(".json", "")] = fs.readJsonSync(join(__data, "templates", templateFiles[i]));
}

// === [ IMPORTS ] === //

require(join(__botdir, "bot.js"));
require(join(__webdir, "web.js"));
