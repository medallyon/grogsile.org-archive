function characterAdd(character)
{
    let member = dClient.eso.guild.members.get(character.ownerId);
    if (!member)
        return;

    let allianceId = dClient.constants.discord.esoi.roles[character.alliance];
    if (!member.roles.has(allianceId))
        dClient.eso.addMemberToAlliance(character.ownerId, allianceId).catch(console.error);
}

module.exports = characterAdd;
