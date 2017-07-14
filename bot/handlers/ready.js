const CronJob = require("cron").CronJob;

dClient.once("ready", () => {
    console.log(dClient.user.username + " is ready to serve.");

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).send(":white_check_mark: Successfully restarted!");
        dClient.config.restarted = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config, (err) => { if (err) console.error(err) });
    }

    for (let guild of dClient.guilds.values())
    {
        utils.readGuildConfig(guild)
        .then(function(guildConfig)
        {
            if (guildConfig.guild.RSS.enabled)
            {
                guild["rss"] = new structs.RSS(guild, guildConfig.guild.RSS);
            }
        }).catch(console.error);
    }

    /* scheduled operations */

    new CronJob("0 0,5,10,15,20,25,30,35,40,45,50,55,60 * * * *", modules.liveServerStatus, null, true, "UTC");
    new CronJob("0 */15 * * * *", modules.changePlayingGame, null, true, "UTC");
});
