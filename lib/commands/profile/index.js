const Discord = require("discord.js");

function profile(msg)
{
    let user = msg.author;
    if (msg.mentions.users.size)
        user = msg.mentions.users.first();

    dClient.eso.fetchAccount(user).then(function(account)
    {
        if (account.private)
        {
            let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setDescription(":grey_exclamation: :eyes: This profile is private");
            return msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
        }

        dClient.eso.fetchCharacters(user).then(function(characters)
        {
            let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
                .setTitle(`@${account.accountName}${(account.champion) ? (" - " + dClient.constants.discord.esoi.emojis.level.champion.emoji + account.level) : ""}`)
                .setDescription(account.about)
                .addField("Mega-Server", account.server, true)
                .addField("Platform", account.platform, true);

            if (account.alliance)
                embed.addField("Preferred Alliance", dClient.constants.discord.esoi.emojis.alliance[account.alliance].emoji + account.alliance, true);

            if (characters.length)
                embed.addField(`Characters (${characters.length})`, "`" + characters.map(c => c.characterName).join("`, `") + "`");

            msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
        }).catch(dClient.modules.utils.consoleError);
    }).catch(function(err)
    {
        console.info(err);
        let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
            .setAuthor(user.tag, user.displayAvatarURL(), `https://esoi.grogsile.org/u/${user.id}/`)
            .setDescription(":grey_question: This profile does not exist");
        msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
    });
}

module.exports = function(msg)
{
    profile(msg);
};

module.exports.name = "profile";
module.exports.about = "Displays an ESOI profile.";
module.exports.alias = [
    "profile"
];
module.exports.arguments = {
    user: {
        description: "An optional @mention for the user to show the profile for.",
        optional: true
    }
};
module.exports.userPermissions = 100;
module.exports.example = "[ @Medallyon#5012 ]";
module.exports.fucntion = profile;
