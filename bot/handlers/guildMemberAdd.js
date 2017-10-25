dClient.on("guildMemberAdd", function(member)
{
    // return if the new member is a bot
    if (member.user.bot) return;

    // process welcome message
    utils.readGuildConfig(member.guild).then(function(config)
    {
        if (config.guild.welcomeMessage.enabled)
        {
            // send private welcome message
            if (config.guild.welcomeMessage.direct.enabled)
            {
                let details = [{ id: member.id, username: member.user.username }];
                member.send(utils.processWelcomeMessage(config.guild.welcomeMessage.direct.message, member.guild, details)).catch(console.error);
            }

            // send guild-wide welcome message
            if (!(config.guild.welcomeMessage.direct.enabled && config.guild.welcomeMessage.direct.disableGuildWelcome))
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
                        dClient.channels.get(config.guild.welcomeMessage.channel).send(utils.processWelcomeMessage(config.guild.welcomeMessage.message, member.guild, savedVars.latestMembers)).catch(console.error);

                        savedVars.latestMembers = [];
                    }

                    fs.outputJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), savedVars, (err) => { if (err) console.error(err) });
                });
            }
        }
    }).catch(console.error);

    // add roles to member if existing
    fs.access(join(__data, "users", member.id, "account.json"), (err) => {
        if (err) return;

        fs.readJson(join(__data, "users", member.id, "account.json"), (err, account) => {
            if (err) console.error(err);

            dClient.modules.addToEsoRank(member.id, account.server, account.platform, account.alliance);
        });
    });
});
