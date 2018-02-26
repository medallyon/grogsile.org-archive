function characterEdit(oldChar, newChar)
{
    let member = _esoi.guild.members.get(newChar.ownerId);
    if (!member) return;

    let allianceId = constants.discord.esoi.roles[newChar.alliance];
    _esoi.fetchCharacters(member).then(function(characters)
    {
        if (!member.roles.has(allianceId)) _esoi.addMemberToAlliance(member, allianceId).catch(console.error);
        
        if (characters.filter(c => c.id !== newChar.id).every(c => c.alliance !== oldChar.alliance) && member.roles.has(constants.discord.esoi.roles[oldChar.alliance]))
        {
            dClient.setTimeout(() => { _esoi.removeMemberFromAlliance(member, constants.discord.esoi.roles[oldChar.alliance]).catch(console.error) }, 1000 * 10);
        }
    }).catch(console.error);
}

module.exports = characterEdit;
