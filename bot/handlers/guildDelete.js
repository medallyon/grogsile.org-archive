dClient.on("guildDelete", function(guild)
{
    fs.remove(guild.config._path).catch(console.error);
});
