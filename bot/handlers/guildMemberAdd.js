dClient.on("guildMemberAdd", function(member)
{
    // return if the new member is a bot
    if (member.user.bot) return;

    let guildConfig = member.guild.config;

    // process welcome message
    if (guildConfig.guild.welcomeMessage.enabled)
    {
        // send private welcome message
        if (guildConfig.guild.welcomeMessage.direct.enabled)
        {
            let details = [{ id: member.id, username: member.user.username }];
            member.send(utils.processWelcomeMessage(guildConfig.guild.welcomeMessage.direct.message, member.guild, details)).catch(console.error);
        }

        // send guild-wide welcome message
        if (!(guildConfig.guild.welcomeMessage.direct.enabled && guildConfig.guild.welcomeMessage.direct.disableGuildWelcome))
        {
            fs.readJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json")).then(function(savedVars)
            {
                // do not allow duplicate name entries
                if (savedVars.latestMembers.map(x => x.id).indexOf(member.id) === -1) savedVars.latestMembers.push({
                    id: member.id,
                    username: member.user.username
                });

                // make sure that members do not exceed limit of 5 per welcome
                guildConfig.guild.welcomeMessage.maxMembers = guildConfig.guild.welcomeMessage.maxMembers <= 5 ? guildConfig.guild.welcomeMessage.maxMembers : 5;
                if (savedVars.latestMembers.length === guildConfig.guild.welcomeMessage.maxMembers)
                {
                    dClient.channels.get(guildConfig.guild.welcomeMessage.channel).send(utils.processWelcomeMessage(guildConfig.guild.welcomeMessage.message, member.guild, savedVars.latestMembers)).catch(console.error);

                    savedVars.latestMembers = [];
                }

                fs.outputJson(join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), savedVars).catch(console.error);
            }).catch(console.error);
        }
    }

    // add roles to member if existing
    fs.access(join(__data, "users", member.id, "account.json"), function(err)
    {
        if (err) return;

        fs.readJson(join(__data, "users", member.id, "account.json")).then(function(err, account)
        {
            if (err) return console.error(err);

            dClient.modules.addToEsoRank(member.id, account.server, account.platform, account.alliance);
        }).catch(console.error);
    });
});
