_esoi.on("characterDelete", function(character)
{
    let member = _esoi.guild.members.get(character.ownerId);
    if (!member) return;

    let allianceId = constants.discord.esoi.roles[character.alliance];
    _esoi.fetchCharacters(member).then(function(characters)
    {
        if (characters.every(c => c.alliance !== character.alliance) && member.roles.has(allianceId)) _esoi.removeMemberFromAlliance(member, allianceId).catch(console.error);
    }).catch(console.error);
});
