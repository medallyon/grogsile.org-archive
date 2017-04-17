function processWelcomeMessage(message, guild, ...members)
{
    for (let i = 0; i < members.length; i++) {
        if (!message.includes(`{member${i+1}}`)) break;
        message.replace(`{member${i+1}}`, dClient.users.get(members[i]));
    }

    if (message.includes("{guild}")) message.replace("{guild}", guild.name);

    return message;
}

module.exports = processWelcomeMessage;
