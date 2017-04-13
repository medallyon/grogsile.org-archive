const fs = require("fs-extra")
, join = require("path").join;

function restart(msg)
{
    console.log(`Restarting in channel #${msg.channel.name}.`);

    dClient.config.restarted = msg.channel.id;
    fs.outputJson(join(__base, "config.json"), dClient.config, (err) => {
        if (err) console.error(err);
        process.exit();
    });
}

module.exports = restart;
