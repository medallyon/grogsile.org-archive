const CronJob = require("cron").CronJob;
global._esoi;

function initESOI() { _esoi = new dClient.structs.ESOI(constants.discord.esoi.id); }

dClient.once("ready", function()
{
    initESOI();

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).send(":white_check_mark: Successfully restarted!").catch(console.error);
        dClient.config.restarted = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config).catch(console.error);
    }

    const guildFiles = fs.readdirSync(join(__data, "guilds"));
    for (let guild of dClient.guilds.values())
    {
        for (let guildId of guildFiles)
        {
            if (!dClient.guilds.has(guildId)) fs.removeSync(join(__data, guildId));
        }

        if (!guildFiles.includes(guild.id)) utils.prepareBaseGuildFiles(guild);

        let guildConfig;
        try
        {
            guildConfig = fs.readJsonSync(join(__data, "guilds", guild.id, "config.json"));
        } catch (err)
        {
            let template = JSON.parse(JSON.stringify(_templates.guild));
            template.id = guild.id;

            guildConfig = template;
        }

        guild.config = utils.treatConfig(guild, guildConfig);
        guild.config._saveSync();

        // if (guild.config.guild.RSS.enabled) guild.rss = new dClient.structs.RSS(guild, guild.config.guild.RSS);
    }

    /* scheduled operations */

    new CronJob("0 5,10,15,20,25,30,35,40,45,50,55,59 * * * *", dClient.modules.liveServerStatus, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.esoNews, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.esoYouTube, null, true, "UTC");
    new CronJob("0 0 * * * *", dClient.modules.esoPatchNotes, null, true, "UTC");
    new CronJob("0 */15 * * * *", dClient.modules.changeActivity, null, true, "UTC", {}, true);

    dClient.readyYet = true;

    // built-in handlers
    dClient.on("message", require("./message.js"));
    dClient.on("guildCreate", require("./guildCreate.js"));
    dClient.on("guildDelete", require("./guildDelete.js"));
    dClient.on("guildMemberAdd", require("./guildMemberAdd.js"));
    dClient.on("guildMemberUpdate", require("./guildMemberUpdate.js"));

    // esoi handlers
    dClient._esoi.on("accountUpdate", require("./esoi/accountUpdate.js"));
    dClient._esoi.on("characterAdd", require("./esoi/characterAdd.js"));
    dClient._esoi.on("characterDelete", require("./esoi/characterDelete.js"));
    dClient._esoi.on("characterEdit", require("./esoi/characterEdit.js"));

    console.log(dClient.user.username + " is ready to serve.");
});
