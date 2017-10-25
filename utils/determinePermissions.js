// int | returns the permission integer for the passed member
var determinePermissions = function(member)
{
    // if member is inside a server
    if (member.guild) {
        // if member is the bot owner/creator (me)
        if (member.id === dClient.config.discord.ownerId) {
            return 1000;
        // else if member is part of the developers
        /*} else if (dClient.savedVars.developers.indexOf(member.id) > -1) {
            return 900;*/
        // else if member is the guild owner
        } else if (member.guild.owner.id === member.id) {
            return 400;
        // else if member is an administrator
        } else if (member.hasPermission("ADMINISTRATOR") || member.hasPermission(["MANAGE_CHANNELS", "MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_ROLES"])) {
            return 300;
        // else if member is a moderator
        } else if (member.hasPermission(["MANAGE_MESSAGES", "MUTE_MEMBERS", "KICK_MEMBERS"])) {
            return 200;
        // else if member is a simple user
        } else {
            return 100;
        }
    // else if member is not on a server
    } else {
        // if member is the bot owner/creator (me)
        if (member.id === dClient.config.discord.ownerId) {
            return 1000;
        // else if member is part of the developers
        /*} else if (dClient.savedVars.developers.indexOf(member.id) > -1) {
            return 900;*/
        // else if member is a simple user
        } else {
            return 100;
        }
    }
}

// export the determinePermissions function
module.exports = determinePermissions;
