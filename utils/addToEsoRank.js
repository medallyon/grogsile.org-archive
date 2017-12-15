const serverTable = [["EU", constants.discord.esoi.roles["EU"]], ["NA", constants.discord.esoi.roles["NA"]]];
const platformTable = [["PS4", constants.discord.esoi.roles["PS4"]], ["XBOne", constants.discord.esoi.roles["XBOne"]]];
const allianceTable = [["Aldmeri Dominion", constants.discord.esoi.roles["Aldmeri Dominion"]], ["Daggerfall Covenenant", constants.discord.esoi.roles["Daggerfall Covenant"]], ["Ebonheart Pact", constants.discord.esoi.roles["Ebonheart Pact"]]];

function addToEsoRank(memberId, server, platform, alliance)
{
    let esoiGuild = dClient.guilds.get(constants.discord.esoi.id);
    if (!esoiGuild.available) return console.warn("Main Guild is currently not available");

    if (esoiGuild.members.has(memberId))
    {
        console.log("Main Guild has member");
        let member = esoiGuild.members.get(memberId);
        if (!member) return;

        let rolesToRemove = []
        , rolesToAdd = [];

        // mega-server rank assignment
        if (!member.roles.exists("name", server)) rolesToAdd.push(esoiGuild.roles.get(constants.discord.esoi.roles[server]));

        let tempRoleTable = serverTable;
        tempRoleTable = tempRoleTable.filter(rt => rt[0] !== server);
        for (let roleData of tempRoleTable)
        {
            if (member.roles.has(roleData[1])) rolesToRemove.push(member.roles.get(roleData[1]));
        }

        // platform rank assignment
        if (!member.roles.exists("name", platform) && platform !== "PC") rolesToAdd.push(esoiGuild.roles.get(constants.discord.esoi.roles[platform]));

        tempRoleTable = platformTable;
        tempRoleTable = tempRoleTable.filter(rt => rt[0] !== platform);
        for (let roleData of tempRoleTable)
        {
            if (member.roles.has(roleData[1])) rolesToRemove.push(member.roles.get(roleData[1]));
        }

        // alliance rank assignment
        if (!member.roles.exists("name", alliance)) rolesToAdd.push(esoiGuild.roles.get(constants.discord.esoi.roles[alliance]));

        tempRoleTable = allianceTable;
        tempRoleTable = tempRoleTable.filter(rt => rt[0] !== alliance);
        for (let roleData of tempRoleTable)
        {
            if (member.roles.has(roleData[1])) rolesToRemove.push(member.roles.get(roleData[1]));
        }

        if (rolesToAdd.length > 0) member.addRoles(rolesToAdd).catch(console.error);
        setTimeout(() => {
            if (rolesToRemove.length > 0) member.removeRoles(rolesToRemove).catch(console.error);
        }, 10000);
    }
}

module.exports = addToEsoRank;
