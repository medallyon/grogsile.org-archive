const Discord = require("discord.js")
, fs = require("fs-extra")
, join = require("path").join;

dClient.on("guildMemberAdd", function(member)
{
    // process welcome message
    utils.readGuildConfig(member.guild).then(function(config)
    {
        if (config.guild.welcomeMessage.enabled)
        {
            fs.readJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), (err, savedVars) => {
                if (err) console.error(err);

                // do not allow duplicate name entries
                if (savedVars.latestMembers.map(x => x.id).indexOf(member.id) === -1) savedVars.latestMembers.push({
                    id: member.id,
                    username: member.user.username
                });

                // make sure that members do not exceed limit of 5 per welcome
                config.guild.welcomeMessage.maxMembers = config.guild.welcomeMessage.maxMembers <= 5 ? config.guild.welcomeMessage.maxMembers : 5;
                if (savedVars.latestMembers.length === config.guild.welcomeMessage.maxMembers)
                {
                    dClient.channels.get(config.guild.welcomeMessage.channel).send(utils.processWelcomeMessage(config.guild.welcomeMessage.message, member.guild, savedVars.latestMembers));

                    savedVars.latestMembers = [];
                }

                fs.outputJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), savedVars, (err) => { if (err) console.error(err) });
            });
        }
    }).catch(console.error);

    // add roles to member if existing
    fs.access(join(__data, "users", member.id, "account.json"), (err) => {
        if (err) return;

        fs.readJson(join(__data, "users", member.id, "account.json"), (err, account) => {
            if (err) console.error(err);

            modules.addToEsoRank(member.id, account.server, account.platform, account.alliance);
        });
    });
});
