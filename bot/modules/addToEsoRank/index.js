function addToEsoRank(memberId, server, platform, alliance)
{
    let esoiGuild = dClient.guilds.get("130716876937494528");
    if (esoiGuild.members.has(memberId))
    {
        let member = esoiGuild.members.get(memberId);
        if (!member) return;

        let rolesToRemove = []
        , rolesToAdd = [];

        // mega-server rank assignment
        if (!member.roles.exists("name", server)) rolesToAdd.push(esoiGuild.roles.find("name", server));

        if (member.roles.exists("name", "EU") && server === "NA") rolesToRemove.push(member.roles.find("name", "EU"));
        else if (member.roles.exists("name", "NA") && server === "EU") rolesToRemove.push(member.roles.find("name", "NA"));

        // platform rank assignment
        if (!member.roles.exists("name", platform) && esoiGuild.roles.exists("name", platform)) rolesToAdd.push(esoiGuild.roles.find("name", platform));

        if (platform === "PC")
        {
            if (member.roles.exists("name", "PS4")) rolesToRemove.push(member.roles.find("name", "PS4"));
            if (member.roles.exists("name", "XBOne")) rolesToRemove.push(member.roles.find("name", "XBOne"));
        } else

        if (platform === "PS4")
        {
            if (member.roles.exists("name", "XBOne")) rolesToRemove.push(member.roles.find("name", "XBOne"));
        } else

        if (platform === "XBOne")
        {
            if (member.roles.exists("name", "PS4")) rolesToRemove.push(member.roles.find("name", "PS4"));
        }

        // alliance rank assignment
        if (!member.roles.exists("name", alliance)) rolesToAdd.push(esoiGuild.roles.find("name", alliance));

        if (alliance === "Aldmeri Dominion")
        {
            if (member.roles.exists("name", "Ebonheart Pact")) rolesToRemove.push(member.roles.find("name", "Ebonheart Pact"));
            if (member.roles.exists("name", "Daggerfall Covenant")) rolesToRemove.push(member.roles.find("name", "Daggerfall Covenant"));
        } else

        if (alliance === "Daggerfall Covenant")
        {
            if (member.roles.exists("name", "Aldmeri Dominion")) rolesToRemove.push(member.roles.find("name", "Aldmeri Dominion"));
            if (member.roles.exists("name", "Ebonheart Pact")) rolesToRemove.push(member.roles.find("name", "Ebonheart Pact"));
        } else

        if (alliance === "Ebonheart Pact")
        {
            if (member.roles.exists("name", "Aldmeri Dominion")) rolesToRemove.push(member.roles.find("name", "Aldmeri Dominion"));
            if (member.roles.exists("name", "Daggerfall Covenant")) rolesToRemove.push(member.roles.find("name", "Daggerfall Covenant"));
        }

        if (rolesToAdd.length > 0) member.addRoles(rolesToAdd).catch(console.error);
        setTimeout(() => {
            if (rolesToRemove.length > 0) member.removeRoles(rolesToRemove).catch(console.error);
        }, 10000);
    }
}

module.exports = addToEsoRank;
