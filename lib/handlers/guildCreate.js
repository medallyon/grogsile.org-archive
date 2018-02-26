function guildCreate(guild)
{
    guild.config = dClient.config.templates.guild;
    guild.config.id = guild.id;

    guild.config = dClient.modules.utils.treatConfig(guild, guild.config);
    guild.config._save().catch(console.error);

    dClient.modules.utils.prepareBaseGuildFiles(guild);

    // dClient.modules.utils.postServerCountToAPI(constants.apiURLs);
}

module.exports = guildCreate;
