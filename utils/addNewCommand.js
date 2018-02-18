function addNewCommand(name, enabled = true, options = {})
{
    for (const guild of dClient.guilds.values())
    {
        guild.config.guild.commands[name] = Object.assign({ enabled: enabled }, options);
        guild.config._save();
    }
}

module.exports = addNewCommand;
