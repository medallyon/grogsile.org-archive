function processWelcomeMessage(message, guild, users)
{
    // replace '{member#}' with mention
    for (let i = 0; i < users.length; i++)
    {
        message = message.replace(`{member${i + 1}}`, `<@${users[i].id}>`);
    }

    // replace '{\member#}' with username
    for (let i = 0; i < users.length; i++)
    {
        message = message.replace(`{\\member${i + 1}}`, users[i].username);
    }

    // replace '{guild}' with guild name
    if (message.includes("{guild}")) message = message.replace(/\{guild\}/g, guild.name);

    return message;
}

module.exports = processWelcomeMessage;
