dClient.on("guildDelete", (guild) => {
    fs.readJson(join(__data, "guilds", guild.id, "config.json"), (err, guildConfig) => {
        if (err) console.error(err);

        fs.remove(join(__data, "guilds", guild.id), (err) => { if (err) console.error(err) });
    });
});
