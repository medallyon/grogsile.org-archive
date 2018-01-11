dClient.on("guildCreate", function(guild)
{
    guild.config = _templates.guild;
    guild.config.id = guild.id;

    guild.config = utils.treatConfig(guild, guild.config);
    guild.config._save().catch(console.error);

    utils.prepareBaseGuildFiles(guild);

    // utils.postServerCountToAPI(constants.apiURLs);
});
