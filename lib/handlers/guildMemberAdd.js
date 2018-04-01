function guildMemberAdd(member)
{
    // return if the new member is a bot
    if (member.user.bot) return;

    let guildConfig = member.guild.config;
    let welcomeSetting = guildConfig.guild.welcomeMessage;

    // process welcome message
    if (welcomeSetting.enabled)
    {
        // send private welcome message
        if (welcomeSetting.direct.enabled)
        {
            let details = [{ id: member.id, username: member.user.username }];
            member.send(dClient.modules.utils.processWelcomeMessage(welcomeSetting.direct.message, member.guild, details)).catch(console.error);
        }

        // send guild-wide welcome message
        if (!(welcomeSetting.direct.enabled && welcomeSetting.direct.disableGuildWelcome))
        {
            dClient.libs.fs.readJson(dClient.libs.join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json")).then(function(savedVars)
            {
                // do not allow duplicate name entries
                if (!savedVars.latestMembers.some(x => x.id === member.id || x.username === member.user.username))
                {
                    savedVars.latestMembers.push({
                        id: member.id,
                        username: member.user.username
                    });
                }

                // make sure that members do not exceed limit of 5 per welcome
                welcomeSetting.maxMembers = welcomeSetting.maxMembers <= 5 ? welcomeSetting.maxMembers : 5;
                if (savedVars.latestMembers.length === parseInt(welcomeSetting.maxMembers))
                {
                    dClient.channels.get(welcomeSetting.channel).send(dClient.modules.utils.processWelcomeMessage(welcomeSetting.message, member.guild, savedVars.latestMembers)).catch(console.error);

                    savedVars.latestMembers = [];
                }

                dClient.libs.fs.outputJson(dClient.libs.join(__data, "guilds", member.guild.id, "welcomeMessage", "savedVariables.json"), savedVars).catch(console.error);
            }).catch(console.error);
        }
    }

    // add roles to member if existing
    dClient.libs.fs.access(dClient.libs.join(__data, "users", member.id, "account.json"), function(err)
    {
        if (err) return;

        dClient.libs.fs.readJson(dClient.libs.join(__data, "users", member.id, "account.json")).then(function(account)
        {
            if (!account.accountName || account.accountName === "undefined") return;

            if (member.guild.id === dClient.constants.discord.esoi.id) dClient.eso.emit("accountUpdate", null, account);
        }).catch(console.error);
    });
}

module.exports = guildMemberAdd;
