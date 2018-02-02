const CronJob = require("cron").CronJob;
global._esoi;

function initESOI() { _esoi = new dClient.structs.ESOI(constants.discord.esoi.id); }

dClient.once("ready", function()
{
    console.log(dClient.user.username + " is ready to serve.");

    initESOI();

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).send(":white_check_mark: Successfully restarted!").catch(console.error);
        dClient.config.restarted = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config).catch(console.error);
    }

    for (let guild of dClient.guilds.values())
    {
        fs.readdir(join(__data, "guilds"), function(err, files)
        {
            if (err) return console.error(err);

            for (let guildId of files)
            {
                if (!dClient.guilds.has(guildId)) fs.remove(join(__data, guildId)).catch(console.error);
            }

            for (let g of dClient.guilds.values())
            {
                if (!files.includes(g.id)) utils.prepareBaseGuildFiles(g);
            }

            fs.readJson(join(__data, "guilds", guild.id, "config.json")).then(function(config)
            {
                guild.config = utils.treatConfig(guild, config);

                if (guild.config.guild.RSS.enabled) guild.rss = new dClient.structs.RSS(guild, guild.config.guild.RSS);
            }).catch(function(err)
            {
                if (err.code === "ENOENT")
                {
                    let template = JSON.parse(JSON.stringify(_templates.guild));

                    template.id = guild.id;

                    guild.config = utils.treatConfig(guild, template);
                    guild.config._save().catch(console.error);
                }
            });
        });
    }

    /* scheduled operations */

    new CronJob("0 5,10,15,20,25,30,35,40,45,50,55,59 * * * *", dClient.modules.liveServerStatus, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.esoNews, null, true, "UTC");
    new CronJob("0 0,15,30,45 * * * *", dClient.modules.esoYouTube, null, true, "UTC");
    new CronJob("0 0 * * * *", dClient.modules.esoPatchNotes, null, true, "UTC");
    new CronJob("0 */15 * * * *", dClient.modules.changeActivity, null, true, "UTC", {}, true);
});
