const roleTable = { "Aldmeri Dominion": dClient.constants.discord.esoi.roles["yellow"], "Daggerfall Covenant": dClient.constants.discord.esoi.roles["blue"], "Ebonheart Pact": dClient.constants.discord.esoi.roles["red"] };

function accountUpdate(oldAccount, newAccount)
{
    let member = dClient.eso.guild.members.get(newAccount.id);
    if (!member)
        return;

    let rolesToAdd = [], rolesToRemove = [];

    if (!oldAccount)
        rolesToAdd = [
            dClient.constants.discord.esoi.roles[newAccount.server],
            dClient.constants.discord.esoi.roles[newAccount.platform],
            roleTable[newAccount.alliance],
            dClient.constants.discord.esoi.roles["Server Updates"]
        ];

    else
    {
        if (oldAccount.server !== newAccount.server)
        {
            if (newAccount.server && !member.roles.has(dClient.constants.discord.esoi.roles[newAccount.server]))
                rolesToAdd.push(dClient.constants.discord.esoi.roles[newAccount.server]);
            if (oldAccount.server && member.roles.has(dClient.constants.discord.esoi.roles[oldAccount.server]))
                rolesToRemove.push(dClient.constants.discord.esoi.roles[oldAccount.server]);
        }

        if (oldAccount.platform !== newAccount.platform)
        {
            if (newAccount.platform && !member.roles.has(dClient.constants.discord.esoi.roles[newAccount.platform]))
                rolesToAdd.push(dClient.constants.discord.esoi.roles[newAccount.platform]);
            if (oldAccount.platform && member.roles.has(dClient.constants.discord.esoi.roles[oldAccount.platform]))
                rolesToRemove.push(dClient.constants.discord.esoi.roles[oldAccount.platform]);
        }

        if (oldAccount.alliance !== newAccount.alliance)
        {
            if (newAccount.alliance)
            {
                let newAllianceId = roleTable[newAccount.alliance];
                if (!member.roles.has(newAllianceId))
                    rolesToAdd.push(newAllianceId);
            }

            if (oldAccount.alliance)
            {
                let oldAllianceId = roleTable[oldAccount.alliance];
                if (member.roles.has(oldAllianceId))
                    rolesToRemove.push(oldAllianceId);
            }
        }

        if (newAccount.updates)
        {
            if (!member.roles.has(dClient.constants.discord.esoi.roles["Server Updates"]))
                rolesToAdd.push(dClient.constants.discord.esoi.roles["Server Updates"]);
        } else

        if (!newAccount.updates)
        {
            if (member.roles.has(dClient.constants.discord.esoi.roles["Server Updates"]))
                rolesToRemove.push(dClient.constants.discord.esoi.roles["Server Updates"]);
        }

        if (newAccount.news)
        {
            if (!member.roles.has(dClient.constants.discord.esoi.roles["ESO News"]))
                rolesToAdd.push(dClient.constants.discord.esoi.roles["ESO News"]);
        } else

        if (!newAccount.news)
        {
            if (member.roles.has(dClient.constants.discord.esoi.roles["ESO News"]))
                rolesToRemove.push(dClient.constants.discord.esoi.roles["ESO News"]);
        }
    }

    if (rolesToAdd.length)
        member.roles.add(rolesToAdd).catch(console.error);

    if (oldAccount)
        dClient.setTimeout(function()
        {
            if (rolesToRemove.length)
                member.roles.remove(rolesToRemove).catch(console.error);
        }, 1000 * 10);

    let nickname = member.displayName, prefix;
    if (newAccount.nickname)
    {
        let newPrefix = `[${newAccount.platform}] `;
        if (newAccount.platform === "XBOne")
            newPrefix = "[XB1] ";

        if (/\[(?:PC|XB1|PS4)\] /g.test(nickname))
        {
            prefix = /(\[(?:PC|XB1|PS4)\] )/g.exec(nickname)[1];
            nickname = nickname.replace(prefix, newPrefix);
        }

        else
            nickname = newPrefix + nickname;
    } else

    if (!newAccount.nickname)
    {
        if (/\[(?:PC|XB1|PS4)\] /g.test(nickname))
        {
            prefix = /(\[(?:PC|XB1|PS4)\] )/g.exec(nickname)[1];
            nickname = nickname.replace(prefix, "");
        }
    }

    member.setNickname(nickname, "Nickname Update").catch(console.error);
}

module.exports = accountUpdate;
