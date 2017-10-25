function readGuildConfig(guild)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__data, "guilds", guild.id, "config.json"), (err, config) => {
            if (err) reject(err);
            else resolve(config);
        });
    });
}

module.exports = readGuildConfig;
