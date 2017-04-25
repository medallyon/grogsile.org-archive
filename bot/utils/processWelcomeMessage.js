function processWelcomeMessage(message, guild, members)
{
    for (let i = 0; i < members.length; i++) {
        if (message.includes(`{member${i+1}}`)) message = message.replace(`{member${i+1}}`, guild.members.get(members[i]));
    }

    for (let i = 0; i < members.length; i++) {
        if (message.includes(`{\\member${i+1}}`)) message = message.replace(`{\\member${i+1}}`, guild.members.get(members[i]).displayName);
    }

    if (message.includes("{guild}")) message = message.replace(/\{guild\}/g, guild.name);

    return message;
}

module.exports = processWelcomeMessage;
