const Discord = require("discord.js")
, CronJob = require("cron").CronJob
, jsonStream = require("JSONStream")
, ESOI = require(dClient.libs.join(__lib, "structs", "ESOI.js"));

function importItemDB()
{
    let database = [];
    dClient.libs.fs.createReadStream(dClient.libs.join(__lib, "commands", "esoItem", "items.json"))
        .pipe(jsonStream.parse("*"))
        .on("error", console.error)
        .on("data", function(item)
        {
            database.push(item);
        })
        .on("end", function()
        {
            dClient.eso.items = new Discord.Collection(database);
            database = null;
        });
}

function activateListeners()
{
    for (const file of dClient.libs.fs.readdirSync(dClient.libs.join(__lib, "handlers")))
    {
        if (file === "ready.js") continue;

        if (!dClient.libs.fs.statSync(dClient.libs.join(__lib, "handlers", file)).isDirectory())
            dClient.on(file.replace(".js", ""), require(dClient.libs.join(__lib, "handlers", file)));

        else
        {
            for (const addHandler of dClient.libs.fs.readdirSync(dClient.libs.join(__lib, "handlers", file)))
                dClient[file].on(addHandler.replace(".js", ""), require(dClient.libs.join(__lib, "handlers", file, addHandler)));
        }
    }
}

function ready()
{
    dClient.eso = new ESOI(dClient, dClient.constants.discord.esoi.id);
    importItemDB();

    if (dClient.config.bot.restarted)
    {
        dClient.channels.get(dClient.config.bot.restarted).send(":white_check_mark: Successfully restarted!").catch(console.error);
        dClient.config.bot.restarted = false;
        dClient.libs.fs.outputJson(dClient.libs.join(__botdir, "config.json"), dClient.config.bot).catch(console.error);
    }

    const guildFiles = dClient.libs.fs.readdirSync(dClient.libs.join(__data, "guilds"));
    for (let guild of dClient.guilds.values())
    {
        for (let guildId of guildFiles)
            if (!dClient.guilds.has(guildId)) dClient.libs.fs.removeSync(dClient.libs.join(__data, guildId));

        if (!guildFiles.includes(guild.id)) dClient.modules.utils.prepareBaseGuildFiles(guild);

        let guildConfig;
        try
        {
            guildConfig = dClient.libs.fs.readJsonSync(dClient.libs.join(__data, "guilds", guild.id, "config.json"));
        } catch (err)
        {
            let template = JSON.parse(JSON.stringify(dClient.config.templates.guild));
            template.id = guild.id;

            guildConfig = template;
        }

        guild.config = dClient.modules.utils.treatConfig(guild, guildConfig);
        guild.config._saveSync();

        // if (guild.config.guild.RSS.enabled) guild.rss = new dClient.structs.RSS(guild, guild.config.guild.RSS);
    }

    /* scheduled operations */

    new CronJob("0 5,10,15,20,25,30,35,40,45,50,55,59 * * * *", dClient.modules.commands.liveServerStatus, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.commands.esoNews, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.commands.esoYouTube, null, true, "UTC");
    new CronJob("0 0 * * * *", dClient.modules.commands.esoPatchNotes, null, true, "UTC");
    new CronJob("0 */15 * * * *", dClient.modules.commands.changeActivity, null, true, "UTC", {}, true);

    activateListeners();

    dClient.loaded = true;

    console.log(dClient.user.username + " is ready to serve.");
}

module.exports = ready;
