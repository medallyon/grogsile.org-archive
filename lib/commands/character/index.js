const Discord = require("discord.js");

function character(msg)
{
    let user = msg.author, character;
    if (msg.mentions.users.size)
        user = msg.mentions.users.first();

    if (msg.args.length === 1)
    {
        if (!msg.mentions.users.size)
            character = msg.args[0];
    }

    else if (msg.args.length >= 2)
    {
        if (msg.mentions.users.size)
            character = msg.args.slice(1);
        else
            character = msg.args[0];
    }

    dClient.eso.fetchAccount(user).then(function(account)
    {
        dClient.eso.fetchCharacters(user).then(function(characters)
        {
            if (!characters.length)
            {
                let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                    .setAuthor(account.accountName + (account.champion ? ` (CP${account.level})` : ""), user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setDescription(":exclamation: This user does not have any characters");
                return msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
            }

            if (!character)
            {
                let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                    .setAuthor(account.accountName + (account.champion ? ` (CP${account.level})` : ""), user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setDescription(`${user.toString()} has **${characters.length}** character${characters.length === 1 ? "" : "s"}`);

                for (let char of characters)
                {
                    let characterRoles = char.roles.map(r => dClient.constants.discord.esoi.emojis.role[r.toLowerCase()].emoji);
                    if (characterRoles.length === 1)
                        characterRoles = [characterRoles[0] + char.roles[0]];

                    let fieldName = `${char.characterName}${char.champion ? ("*") : (" (lvl " + char.level) + ")"}`
                    , fieldValue = `${dClient.constants.discord.esoi.emojis.class[char.class.toLowerCase().split(" ").join("")].emoji}${char.class}\n${dClient.constants.discord.esoi.emojis.alliance[char.alliance].emoji}${char.alliance}\n${dClient.constants.discord.esoi.emojis.race[char.race.toLowerCase()].emoji}${char.race}\n${characterRoles.join("")}`;

                    embed.addField(fieldName, fieldValue, true);
                }

                msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
            }

            else
            {
                character = characters.find(c => character.toLowerCase() === c.characterName.toLowerCase() || c.characterName.toLowerCase().includes(character.toLowerCase()));

                if (!character)
                {
                    let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                        .setAuthor(account.accountName, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                        .setDescription(":x: The specified character does not exist");

                    return msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
                }

                let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                    .setAuthor(account.accountName + (account.champion ? ` (CP${account.level})` : ""), user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setTitle(character.characterName)
                    .setDescription(character.biography)
                    .addField("Level", (character.champion ? (dClient.constants.discord.esoi.emojis.level.champion.emoji + account.level) : (dClient.constants.discord.esoi.emojis.level.normal.emoji + character.level)), true)
                    .addField("Race", dClient.constants.discord.esoi.emojis.race[character.race.toLowerCase()].emoji + character.race, true)
                    .addField("Class", dClient.constants.discord.esoi.emojis.class[character.class.toLowerCase().split(" ").join("")].emoji + character.class, true)
                    .addField("Alliance", dClient.constants.discord.esoi.emojis.alliance[character.alliance].emoji + character.alliance, true)
                    .addField("Roles", character.roles.map(r => dClient.constants.discord.esoi.emojis.role[r.toLowerCase()].emoji + r).join(", "), true)
                    .addField("Professions", "`" + character.professions.join("`, `") + "`", true)
                    .setImage(character.avatarURL);

                msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
            }
        }).catch(function(err)
        {
            dClient.modules.utils.consoleError({ name: "500", message: ":x: Something went wrong while reading this user's characters." }, null, msg.channel);
        });
    }).catch(function(err)
    {
        dClient.modules.utils.consoleError({ name: "404", message: ":grey_question: This profile could not be found." }, null, msg.channel);
    });
}

module.exports = function(msg)
{
    character(msg);
};

module.exports.about = {
    name: "character",
    description: "Shows character summary."
}
module.exports.alias = [
    "characters",
    "chars",
    "character",
    "char"
];
module.exports.args = {
    user: {
        description: "An optional @mention to show the character for.",
        optional: true
    },
    character: {
        description: "The character you would like to look up. Omit this to view all characters.",
        optional: true
    }
};
module.exports.userPermissions = 100;
module.exports.example = "[ @Medallyon#5012 ] [ Medallyah ]";
module.exports.function = character;
