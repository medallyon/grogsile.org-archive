let defaultErrorEmbed = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
    .setColor(utils.randColor())
    .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

function character(msg)
{
    let user = msg.author, character;
    if (msg.mentions.users.size) user = msg.mentions.users.first();

    if (msg.args.length === 1)
    {
        if (!msg.mentions.users.size) character = msg.args[0];
    } else

    if (msg.args.length >= 2)
    {
        if (msg.mentions.users.size) character = msg.args.slice(1);
        else character = msg.args[0];
    }

    _esoi.fetchAccount(user).then(function(account)
    {
        _esoi.fetchCharacters(user).then(function(characters)
        {
            if (!characters.length)
            {
                let embed = defaultErrorEmbed
                    .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setDescription(":exclamation: This user does not have any characters");
                return msg.channel.send({ embed }).catch(console.error);
            }

            if (!character)
            {
                let finalEmbed = new Discord.MessageEmbed()
                    .setColor(utils.randColor())
                    .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setDescription(`${user.toString()} has **${characters.length}** character${characters.length === 1 ? "" : "s"}`)
                    .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

                for (let char of characters)
                {
                    finalEmbed.addField(`${char.characterName} (${char.champion ? ("CP" + account.level) : ("lvl " + char.level)})`, `${constants.discord.esoi.emojis.class[char.class.toLowerCase().split(" ").join("")].emoji}${char.class}\n${constants.discord.esoi.emojis.alliance[char.alliance].emoji}${char.alliance}\n${constants.discord.esoi.emojis.race[char.race.toLowerCase()].emoji}${char.race}\n${char.roles.map(r => constants.discord.esoi.emojis.role[r.toLowerCase()].emoji).join(" ")}`, true);
                }

                msg.channel.send({ embed: finalEmbed }).catch(console.error);
            }

            else
            {
                character = characters.find(c => character.toLowerCase() === c.characterName.toLowerCase() || c.characterName.toLowerCase().includes(character.toLowerCase()));

                if (!character)
                {
                    let embed = defaultErrorEmbed
                        .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                        .setDescription(":x: The specified character does not exist");

                    return msg.channel.send({ embed }).catch(console.error);
                }

                let finalEmbed = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
                    .setColor(utils.randColor())
                    .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                    .setTitle(character.characterName)
                    .setDescription(character.biography)
                    .addField("Level", (character.champion ? (constants.discord.esoi.emojis.level.champion.emoji + account.level) : (constants.discord.esoi.emojis.level.normal.emoji + character.level)), true)
                    .addField("Race", constants.discord.esoi.emojis.race[character.race.toLowerCase()].emoji + character.race, true)
                    .addField("Class", constants.discord.esoi.emojis.class[character.class.toLowerCase().split(" ").join("")].emoji + character.class, true)
                    .addField("Alliance", constants.discord.esoi.emojis.alliance[character.alliance].emoji + character.alliance, true)
                    .addField("Roles", character.roles.map(r => constants.discord.esoi.emojis.role[r.toLowerCase()].emoji + r).join(", "), true)
                    .addField("Professions", "`" + character.professions.join("`, `") + "`", true)
                    .setImage(character.avatarURL)
                    .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

                msg.channel.send({ embed: finalEmbed }).catch(console.error);
            }
        }).catch(function(err)
        {
            console.info(err);
            let embed = defaultErrorEmbed
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setDescription(":x: Something went wrong while reading this user's characters");
            msg.channel.send({ embed }).catch(console.error);
        });
    }).catch(function(err)
    {
        console.info(err);
        let embed = defaultErrorEmbed
            .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
            .setDescription(":grey_question: This profile does not exist");
        msg.channel.send({ embed }).catch(console.error);
    });
}

module.exports = character;
