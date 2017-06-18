function addToEsoRank(memberId, server, platform, alliance)
{
    let esoiGuild = dClient.guilds.get(constants.discord.esoi.id);
    if (esoiGuild.members.has(memberId))
    {
        let member = esoiGuild.members.get(memberId);
        if (!member) return;

        let rolesToRemove = []
        , rolesToAdd = [];

        // mega-server rank assignment
        if (!member.roles.exists("name", server)) rolesToAdd.push(esoiGuild.roles.find("name", server));

        if (member.roles.has(constants.discord.esoi.roles.EU) && server === "NA") rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.EU));
        else if (member.roles.has(constants.discord.esoi.roles.NA) && server === "EU") rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.NA));

        // platform rank assignment
        if (!member.roles.exists("name", platform)) rolesToAdd.push(esoiGuild.roles.find("name", platform));

        if (platform === "PC")
        {
            if (member.roles.has(constants.discord.esoi.roles.PS4)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.PS4));
            if (member.roles.has(constants.discord.esoi.roles.XBOne)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.XBOne));
        } else

        if (platform === "PS4")
        {
            if (member.roles.has(constants.discord.esoi.roles.XBOne)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.XBOne));
        } else

        if (platform === "XBOne")
        {
            if (member.roles.has(constants.discord.esoi.roles.PS4)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.PS4));
        }

        // alliance rank assignment
        if (!member.roles.exists("name", alliance)) rolesToAdd.push(esoiGuild.roles.find("name", alliance));

        if (alliance === "Aldmeri Dominion")
        {
            if (member.roles.has(constants.discord.esoi.roles.EbonheartPact)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.EbonheartPact));
            if (member.roles.has(constants.discord.esoi.roles.DaggerfallCovenant)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.DaggerfallCovenant));
        } else

        if (alliance === "Daggerfall Covenant")
        {
            if (member.roles.has(constants.discord.esoi.roles.AldmeriDominion)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.AldmeriDominion));
            if (member.roles.has(constants.discord.esoi.roles.EbonheartPact)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.EbonheartPact));
        } else

        if (alliance === "Ebonheart Pact")
        {
            if (member.roles.has(constants.discord.esoi.roles.AldmeriDominion)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.AldmeriDominion));
            if (member.roles.has(constants.discord.esoi.roles.DaggerfallCovenant)) rolesToRemove.push(member.roles.get(constants.discord.esoi.roles.DaggerfallCovenant));
        }

        if (rolesToAdd.length > 0) member.addRoles(rolesToAdd).catch(console.error);
        setTimeout(() => {
            if (rolesToRemove.length > 0) member.removeRoles(rolesToRemove).catch(console.error);
        }, 10000);
    }
}

module.exports = addToEsoRank;
