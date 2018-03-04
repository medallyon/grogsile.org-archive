// boolean | returns whether the passed member has access to passed command
function hasPermission(command, member)
{
    // return true if the member's permissions are higher than what is required by the command
    return (dClient.modules.utils.determinePermissions(member) >= command.userPermissions);
}

// export the hasPermission function
module.exports = hasPermission;
