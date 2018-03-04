function guildDelete(guild)
{
    dClient.libs.fs.remove(guild.config._path).catch(console.error);
}

module.exports = guildDelete;
