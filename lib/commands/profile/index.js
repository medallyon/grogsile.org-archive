const Discord = require("discord.js");

let defaultErrorEmbed = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject());

function profile(msg)
{
    let user = msg.author;
    if (msg.mentions.users.size) user = msg.mentions.users.first();

    dClient.eso.fetchAccount(user).then(function(account)
    {
        if (account.private)
        {
            let embed = defaultErrorEmbed
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setDescription(":grey_exclamation: :eyes: This profile is private");
            return msg.channel.send({ embed }).catch(console.error);
        }

        dClient.eso.fetchCharacters(user).then(function(characters)
        {
            let finalEmbed = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
                .setColor(dClient.modules.utils.randColor())
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setTitle(`@${account.accountName}${(account.champion) ? (" - " + dClient.constants.discord.esoi.emojis.level.champion.emoji + account.level) : ""}`)
                .setDescription(account.about)
                .addField("Mega-Server", account.server, true)
                .addField("Platform", account.platform, true)
                .setFooter(dClient.constants.discord.embed.footer.text, dClient.constants.discord.embed.footer.icon_url);

            if (account.alliance) finalEmbed.addField("Preferred Alliance", dClient.constants.discord.esoi.emojis.alliance[account.alliance].emoji + account.alliance, true);

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
