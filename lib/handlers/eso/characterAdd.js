function characterAdd(character)
{
    let member = _esoi.guild.members.get(character.ownerId);
    if (!member) return;

    let allianceId = constants.discord.esoi.roles[character.alliance];
    if (!member.roles.has(allianceId)) _esoi.addMemberToAlliance(character.ownerId, allianceId).catch(console.error);
}

module.exports = characterAdd;
