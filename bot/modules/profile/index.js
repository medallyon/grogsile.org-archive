let defaultErrorEmbed = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
    .setColor(utils.randColor())
    .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

function profile(msg)
{
    let user = msg.author;
    if (msg.mentions.users.size) user = msg.mentions.users.first();

    console.log(user.username.toUpperCase());

    _esoi.fetchAccount(user).then(function(account)
    {
        if (account.private)
        {
            let embed = defaultErrorEmbed
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setDescription(":grey_exclamation: :eyes: This profile is private");
            return msg.channel.send({ embed }).catch(console.error);
        }

        _esoi.fetchCharacters(user).then(function(characters)
        {
            let finalEmbed = new Discord.MessageEmbed(utils.createEmptyRichEmbedObject())
                .setColor(utils.randColor())
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setTitle(`@${account.accountName}${(account.champion) ? (" - " + constants.discord.esoi.emojis.level.champion.emoji + account.level) : ""}`)
                .setDescription(account.about)
                .addField("Mega-Server", account.server, true)
                .addField("Platform", account.platform, true)
                .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

            if (account.alliance) finalEmbed.addField("Preferred Alliance", constants.discord.esoi.emojis.alliance[account.alliance].emoji + account.alliance, true);

            if (characters.length) finalEmbed.addField(`Characters (${characters.length})`, "`" + characters.map(c => c.characterName).join("`, `") + "`");

            msg.channel.send({ embed: finalEmbed }).catch(console.error);
        }).catch(console.error);
    }).catch(function(err)
    {
        console.info(err);
        let embed = defaultErrorEmbed
            .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
            .setDescription(":grey_question: This profile does not exist");
        msg.channel.send({ embed }).catch(console.error);
    });
}

module.exports = profile;
