const CronJob = require("cron").CronJob;

dClient.once("ready", function()
{
    console.log(dClient.user.username + " is ready to serve.");

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).send(":white_check_mark: Successfully restarted!").catch(console.error);
        dClient.config.restarted = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config).catch(console.error);
    }

    for (let guild of dClient.guilds.values())
    {
        fs.readJson(join(__data, "guilds", guild.id, "config.json")).then(function(config)
        {
            guild.config = utils.treatConfig(guild, config);

            if (guild.config.guild.RSS.enabled) guild.rss = new dClient.structs.RSS(guild, guild.config.guild.RSS);
        }).catch(console.error);
    }

    /* scheduled operations */

    new CronJob("0 0,5,10,15,20,25,30,35,40,45,50,55,60 * * * *", dClient.modules.liveServerStatus, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.esoNews, null, true, "UTC");
    new CronJob("0 0 * * * *", dClient.modules.esoPatchNotes, null, true, "UTC");
    new CronJob("0 */15 * * * *", dClient.modules.changePlayingGame, null, true, "UTC", {}, true);
});
