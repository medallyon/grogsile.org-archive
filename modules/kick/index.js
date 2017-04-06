const Discord = require("discord.js");

function kickList(members)
{
    let kicked = []
    , count = 0;
    return new Promise(function(resolve, reject)
    {
        if (!Array.isArray(members)) reject(new TypeError("members needs to be an array."));
        else if (members.length === 0) reject(new RangeError("members needs to contain at least one member."));

        for (let member of members) {
            member.kick()
                .then(m => {
                    count++;
                    kicked.push(m);
                    if (count === members.length) resolve(kicked);
                }).catch(err => {
                    count++;
                    console.error(err);
                    if (count === members.length) resolve(kicked);
                });
        }
    });
}

function constructEmbed(members, author)
{
    let e = new Discord.RichEmbed()
        .setColor("#F47742")
        .setFooter("Brought to you by Grogsile Inc.", "https://i.grogsile.me/favicon.png")
        .setTimestamp(new Date().toISOString());

    if (members.length === 1)
    {
        e.setAuthor("Kick", author.avatarURL)
        .setDescription(`Successfully kicked **${members[0].user.username}** (${members[0].id}).`);
    }

    else {
        e.setAuthor("Members kicked", author.avatarURL);
        for (let member of members) {
            e.addField(member.user.username, member.id, true);
        }
    }

    return e;
}

function kick(msg)
{
    if (msg.args.length === 0)
    {
        msg.args[0] = "kick";
        return modules.help(msg);
    } else

    if (msg.mentions.users.size > 0)
    {
        let toBeKicked = [];

        if (msg.mentions.users.size === 1 && utils.determinePermissions(msg.member) < utils.determinePermissions(msg.guild.member(msg.mentions.users.first()))) return msg.channel.sendMessage(`You do not have the necessary permissions to kick **${msg.mentions.users.first().username}**.`);

        for (let user of msg.mentions.users.values()) {
            if (msg.guild.members.has(user.id) && utils.determinePermissions(msg.member) > utils.determinePermissions(msg.guild.member(user)));
            {
                toBeKicked.push(msg.guild.member(user));
            }
        }

        if (toBeKicked.length === 0) msg.channel.sendMessage("No members are eligible to be kicked.");
        else kickList(toBeKicked)
            .then(kicked => {
                msg.channel.sendEmbed(constructEmbed(kicked, msg.author));
            }).catch(console.error);
    }

    else
    {
        let toBeKicked = []
        , userIds = msg.args;
        for (let id of userIds) {
            if (msg.guild.members.has(id) && utils.determinePermissions(msg.member) > utils.determinePermissions(msg.guild.members.get(id)))
            {
                toBeKicked.push(msg.guild.members.get(id));
            }
        }

        if (toBeKicked.length === 0) msg.channel.sendMessage("No members are eligible to be kicked.");
        else kickList(toBeKicked)
            .then(kicked => {
                msg.channel.sendEmbed(constructEmbed(kicked, msg.author));
            }).catch(console.error);
    }
};

module.exports = kick;
