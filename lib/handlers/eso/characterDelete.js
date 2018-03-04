function characterDelete(character)
{
    let member = dClient.eso.guild.members.get(character.ownerId);
    if (!member) return;

    let allianceId = dClient.constants.discord.esoi.roles[character.alliance];
    dClient.eso.fetchCharacters(member).then(function(characters)
    {
        if (characters.every(c => c.alliance !== character.alliance) && member.roles.has(allianceId)) dClient.eso.removeMemberFromAlliance(member, allianceId).catch(console.error);
    }).catch(console.error);
}

module.exports = characterDelete;
