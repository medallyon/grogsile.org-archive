const Discord = require("discord.js")
, fs = require("fs-extra")
, join = require("path").join;

dClient.on("guildMemberAdd", function(member)
{
    utils.readGuildConfig(member.guild).then(function(config)
    {
        if (config.guild.welcomeMessage.enabled)
        {
            fs.readJson(join(__data, "guilds", `${member.guild.id}`, "welcomeMessage", "savedVariables.json"), (err, savedVars) => {
                if (err) console.error(err);

                if (savedVars.latestMembers.length === 3)
                {
                    dClient.channels.get(config.guild.welcomeMessage.channel).sendMessage(utils.processWelcomeMessage(config.guild.welcomeMessage.message, member.guild, savedVars.latestMembers));

                    savedVars.latestMembers = [];
                    fs.outputJson(join(__data, "guilds", `${member.guild.id}`, "welcomeMessage", "savedVariables.json"), (err) => { if (err) console.error(err) });
                }
            });
        }
    }).catch(console.error);
});
