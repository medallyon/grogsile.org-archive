const Discord = require("discord.js")
, fs = require("fs-extra")
, join = require("path").join;

dClient.on("guildMemberAdd", function(member)
{
    utils.readGuildConfig(member.guild).then(function(config)
    {
        if (config.guild.welcomeMessage.enabled)
        {
            fs.readJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), (err, savedVars) => {
                if (err) console.error(err);

                // do not allow duplicate name entries
                if (savedVars.latestMembers.indexOf(member.id) === -1) savedVars.latestMembers.push(member.id);

                // make sure that members do not exceed limit of 5 per welcome
                config.guild.welcomeMessage.maxMembers = config.guild.welcomeMessage.maxMembers <= 5 ? config.guild.welcomeMessage.maxMembers : 5;
                if (savedVars.latestMembers.length === config.guild.welcomeMessage.maxMembers)
                {
                    dClient.channels.get(config.guild.welcomeMessage.channel).sendMessage(utils.processWelcomeMessage(config.guild.welcomeMessage.message, member.guild, savedVars.latestMembers));

                    savedVars.latestMembers = [];
                }

                fs.outputJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), savedVars, (err) => { if (err) console.error(err) });
            });
        }
    }).catch(console.error);
});
