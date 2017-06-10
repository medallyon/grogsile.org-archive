const fs = require("fs-extra")
, join = require("path").join;

dClient.once("ready", () => {
    console.log(dClient.user.username + " is ready to serve.");

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).send(":white_check_mark: Successfully restarted!");
        dClient.config.restarted = false;
        fs.outputJson(join(__botdir, "config.json"), dClient.config, (err) => { if (err) console.error(err) });
    }

    dClient.setInterval(function()
    {
        modules.liveServerStatus();
    }, 1000 * 60 * 5 );
});
