const Discord = require("discord.js");

function consoleError(error, message = null, channel = null)
{
    if (!error)
        throw new Error("{error} must be a value");

    let errorEmbed;

    if (!(error instanceof Error) && (typeof error) === "object")
    {
        let name = error.name
        , message = error.message
        , details = error.details;

        errorEmbed = new dClient.modules.structs.ErrorEmbed(name, message, details);
    }

    else if (error instanceof Error)
    {
        errorEmbed = new dClient.modules.structs.ErrorEmbed(error);
    }

    if (message && message instanceof Discord.Message)
        message.edit({ embed: errorEmbed }).catch(console.error);
    else if (channel && channel instanceof Discord.TextChannel)
        channel.send({ embed: errorEmbed }).catch(console.error);
}

module.exports = consoleError;
