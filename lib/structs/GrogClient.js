// === [ MODULE IMPORTS ] === //

const Discord = require("discord.js")
, Raven = require("raven")
, fs = require("fs-extra")
, join = require("path").join

, PersistentVars = require(join(__lib, "structs", "PersistentVars.js"));

// === [ STATIC VARIABLES ] === //

let consoleIsModified = false;

// === [ CLASS DECLARATION ] === //

class GrogClient extends Discord.Client
{
    modifyConsoleError()
    {
        if (consoleIsModified) return;

        // Raven.config(this.config.generic.raven.dsn || this.config.generic.raven.key).install();
        Raven.config(this.config.bot.raven.dsn || this.config.bot.raven.key).install();
        this.Raven = Raven;

        const oldErrorFunction = console.error;
        console.debug = oldErrorFunction;
        console.error = function(data)
        {
            oldErrorFunction(data);

            if (!(data instanceof Error)) data = new Error(data);

            Raven.captureException(data);
        };

        consoleIsModified = true;
    }

    loadUtils()
    {
        this.modules.utils = {};
        this.modules.utils.implementReload = require(this.libs.join(__lib, "utils", "implementReload.js"));

        for (const file of this.libs.fs.readdirSync(this.libs.join(__lib, "utils")))
        {
            let scriptPath = this.libs.join(__lib, "utils", file)
            , scriptName = file.replace(".js", "");

            this.modules.utils[scriptName] = require(scriptPath);
            this.modules.utils[scriptName].reload = this.modules.utils.implementReload(scriptName, scriptPath, this.modules.utils);
        }
    }

    loadCommands()
    {
        this.modules.commands = {};
        for (const file of this.libs.fs.readdirSync(this.libs.join(__lib, "commands")))
        {
            let scriptPath = this.libs.join(__lib, "commands", file, "index.js");

            this.modules.commands[file] = require(scriptPath);
            this.modules.commands[file].reload = this.modules.utils.implementReload(file, scriptPath, this.modules.commands);
        }
    }

    loadStructures()
    {
        this.modules.structs = {};
        for (const file of this.libs.fs.readdirSync(this.libs.join(__lib, "structs")))
        {
            let scriptPath = this.libs.join(__lib, "structs", file)
            , scriptName = file.replace(".js", "");

            this.modules.structs[scriptName] = require(scriptPath);
            this.modules.structs[scriptName].reload = this.modules.utils.implementReload(scriptName, scriptPath, this.modules.structs);
        }
    }

    loadHandlers()
    {
        for (const file of this.libs.fs.readdirSync(this.libs.join(__lib, "handlers")).filter(x => x !== "eso"))
            require(this.libs.join(__lib, "handlers", file));
    }

    login()
    {
        return super.login(this.config.bot.discord.token);
    }

    initiateWebPartition()
    {
        require(this.libs.join(__webdir, "web.js"));
    }

    constructor(options = {})
    {
        super(options);

        global.dClient = this;

        this.loaded = false;
        this.reloading = false;

        // === [ CONFIG IMPORTS ] === //

        this.persistentVars = new PersistentVars();
        this.constants = require(join(__base, "constants.js"));
        this.config = {
            templates: {},
            bot: require(join(__botdir, "config.json")),
            web: require(join(__webdir, "config.json"))
        };

        let templateFiles = fs.readdirSync(join(__data, "templates"));
        for (let i = 0; i < templateFiles.length; i++)
            this.config.templates[templateFiles[i].replace(".json", "")] = fs.readJsonSync(join(__data, "templates", templateFiles[i]));

        this.commands = require(join(__botdir, "commands.json"));

        // === [ MODIFY CONSOLE ERROR ] === //

        this.modifyConsoleError();

        // === [ MODULE IMPORTS ] === //

        this.libs = {
            fs: require("fs-extra"),
            join: require("path").join,
            dateFormat: require("dateformat")
        };

        this.modules = {};

        this.loadUtils();
        this.loadCommands();
        this.loadStructures();
        this.loadHandlers();

        this.eso = {};

        this.initiateWebPartition();

        // === [ CLIENT LOADED ] === //

        this.once("ready", require(this.libs.join(__lib, "handlers", "ready.js")));
    }
}

module.exports = GrogClient;
