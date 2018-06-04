function characterEdit(oldChar, newChar)
{
    let member = dClient.eso.guild.members.get(newChar.ownerId);
    if (!member)
        return;

    let allianceId = dClient.constants.discord.esoi.roles[newChar.alliance];
    dClient.eso.fetchCharacters(member).then(function(characters)
    {
        if (!member.roles.has(allianceId))
            dClient.eso.addMemberToAlliance(member, allianceId).catch(console.error);

        if (characters.filter(c => c.id !== newChar.id).every(c => c.alliance !== oldChar.alliance) && member.roles.has(dClient.constants.discord.esoi.roles[oldChar.alliance]))
        {
            dClient.setTimeout(function()
            {
                dClient.eso.removeMemberFromAlliance(member, dClient.constants.discord.esoi.roles[oldChar.alliance]).catch(console.error);
            }, 1000 * 10);
        }
    }).catch(console.error);
}

module.exports = characterEdit;
