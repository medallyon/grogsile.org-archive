const fs = require("fs-extra")
, join = require("path").join;

dClient.on("guildDelete", (guild) => {
    fs.readJson(join(__data, "guilds", guild.id, "config.json"), (err, guildConfig) => {
        if (err) console.error(err);

        fs.readJson(join(__data, "subscriptions.json"), (err, subscriptions) => {
            if (err) console.error(err);

            for (let channel of guild.channels)
            {
                if (subscriptions.eso.indexOf(channel.id) > -1) subscriptions.eso.splice(subscriptions.eso.indexOf(channel.id));
                if (subscriptions.youtube.indexOf(channel.id) > -1) subscriptions.youtube.splice(subscriptions.youtube.indexOf(channel.id));
            }
        });

        fs.remove(join(__data, "guilds", guild.id), (err) => { if (err) console.error(err) });
    });
});
