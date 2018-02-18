function guildDelete(guild)
{
    fs.remove(guild.config._path).catch(console.error);
}

module.exports = guildDelete;
