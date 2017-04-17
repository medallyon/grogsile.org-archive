// === [ LIBRARIES ] === //

const fs = require("fs-extra")
, path = require("path")
, join = path.join

, Discord = require("discord.js")

, watch = require("watch");

// === [ DISCORD ] === //

client = new Discord.Client();
global.dClient = client;

dClient.config = fs.readJsonSync(join(__dirname, "config.json"));
dClient.commands = fs.readJsonSync(join(__dirname, "commands.json"));

// === [ MODULE IMPORTS ] === //

// import global utils
global.utils = {};
for (let file of fs.readdirSync(path.join(__dirname, "utils")))
{
    utils[file.replace(".js", "")] = require(path.join(__dirname, "utils", file));
}

// create an event-driven monitor for watching utils
watch.createMonitor(path.join(__dirname, "utils"), {
    filter: (x) => x.endsWith(".js"),
    interval: 30
}, function(monitor)
{
    monitor.on("created", (file, stat) => {
        utils[file.replace(/.*(\/|\\)/g, "").replace(".js", "")] = require(file);
    })
    .on("changed", (file, curr, prev) => {
        console.log(`recaching ${file}`);
        decache(file);
        utils[file.replace(/.*(\/|\\)/g, "").replace(".js", "")] = require(file);
    })
    .on("removed", (file, stat) => {
        decache(file);
        delete utils[file.replace(/.*(\/|\\)/g, "").replace(".js", "")];
    });
});

// import command modules
global.modules = {};
for (let file of fs.readdirSync(path.join(__dirname, "modules")))
{
    modules[file] = require(path.join(__dirname, "modules", file, "index.js"));
}

// create another event-driven monitor for modules, each based in its own sub-directory
watch.createMonitor(path.join(__dirname, "modules"), {
    interval: 30
}, function(monitor)
{
    monitor.on("created", (file, stat) => {
        if (file.replace(/.*(\/|\\)/g, "") === "index.js") modules[file.replace(/.*(\/|\\)/g, "").replace(".js", "")] = require(file);
    })
    .on("changed", (file, curr, prev) => {
        console.log(`recaching ${file}`);

        if (file.replace(/.*(\/|\\)/g, "") === "index.js")
        {
            decache(file);
            modules[file.replace(/.*(\/|\\)/g, "").replace(".js", "")] = require(file);
        }
    })
    .on("removed", (file, stat) => {
        decache(file);
        delete modules[file.replace(/.*(\/|\\)/g, "").replace(".js", "")];
    });
});

// import Discord event handlers
for (let file of fs.readdirSync(path.join(__dirname, "handlers")))
{
    require(path.join(__dirname, "handlers", file));
}

// log in to Discord using the Discord BOT token
client.login(dClient.config.discord.token)
    .catch(console.error);
