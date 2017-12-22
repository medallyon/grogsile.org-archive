const roleTable = { "Aldmeri Dominion": constants.discord.esoi.roles["yellow"], "Daggerfall Covenant": constants.discord.esoi.roles["blue"], "Ebonheart Pact": constants.discord.esoi.roles["red"] };

_esoi.on("accountUpdate", function(oldAccount, newAccount)
{
    let member = _esoi.guild.members.get(newAccount.id);
    if (!member) return;

    let rolesToAdd = [], rolesToRemove = [];

    if (oldAccount.server !== newAccount.server)
    {
        if (newAccount.server && !member.roles.has(constants.discord.esoi.roles[newAccount.server])) rolesToAdd.push(constants.discord.esoi.roles[newAccount.server]);
        if (oldAccount.server && member.roles.has(constants.discord.esoi.roles[oldAccount.server])) rolesToRemove.push(constants.discord.esoi.roles[oldAccount.server]);
    }

    if (oldAccount.platform !== newAccount.platform)
    {
        if (newAccount.platform && !member.roles.has(constants.discord.esoi.roles[newAccount.platform])) rolesToAdd.push(constants.discord.esoi.roles[newAccount.platform]);
        if (oldAccount.platform && member.roles.has(constants.discord.esoi.roles[oldAccount.platform])) rolesToRemove.push(constants.discord.esoi.roles[oldAccount.platform]);
    }

    if (oldAccount.alliance !== newAccount.alliance)
    {
        if (newAccount.alliance)
        {
            let newAllianceId = roleTable[newAccount.alliance];
            if (!member.roles.has(newAllianceId)) rolesToAdd.push(newAllianceId);
        }

        if (oldAccount.alliance)
        {
            let oldAllianceId = roleTable[oldAccount.alliance];
            if (member.roles.has(oldAllianceId)) rolesToRemove.push(oldAllianceId);
        }
    }

    if (newAccount.updates)
    {
        if (!member.roles.has(constants.discord.esoi.roles["Server Updates"])) rolesToAdd.push(constants.discord.esoi.roles["Server Updates"]);
    }

    else
    {
        if (member.roles.has(constants.discord.esoi.roles["Server Updates"])) rolesToRemove.push(constants.discord.esoi.roles["Server Updates"]);
    }

    member.addRoles(rolesToAdd).catch(console.error);
    dClient.setTimeout(() => { member.removeRoles(rolesToRemove).catch(console.error) }, 1000 * 10);
});
