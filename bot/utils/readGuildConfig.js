const fs = require("fs-extra")
, join = require("path").join;

function readGuildConfig(guild)
{
    return new Promise(function(resolve, reject)
    {
        if (!guild) reject(new ReferenceError("Guild must be an object"));

        fs.readJson(join(__data, "guilds", guild.id, "config.json"), (err, config) => {
            if (err) reject(err);
            else resolve(config);
        });
    });
}

module.exports = readGuildConfig;
