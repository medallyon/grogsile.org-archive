function banList(members)
{
    let banned = []
    , count = 0;
    return new Promise(function(resolve, reject)
    {
        if (!Array.isArray(members)) reject(new TypeError("members needs to be an array."));
        else if (members.length === 0) reject(new RangeError("members needs to contain at least one member."));

        for (let member of members) {
            member.ban()
                .then(m => {
                    count++;
                    banned.push(m);
                    if (count === members.length) resolve(banned);
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
    let e = new Discord.RichEmbed(constants.discord.embed)
        .setColor("#8E1919")
        .setTimestamp(new Date().toISOString());

    if (members.length === 1)
    {
        e.setAuthor("Ban", author.avatarURL)
        .setDescription(`Successfully banned **${members[0].user.username}** (${members[0].id}).`);
    }

    else {
        e.setAuthor("Members banned", author.avatarURL);
        for (let member of members) {
            e.addField(member.user.username, member.id, true);
        }
    }

    return e;
}

function ban(msg)
{
    if (msg.args.length === 0)
    {
        msg.args[0] = "ban";
        return modules.help(msg);
    } else

    if (msg.mentions.users.size > 0)
    {
        let toBebanned = [];

        if (msg.mentions.users.size === 1 && utils.determinePermissions(msg.member) < utils.determinePermissions(msg.guild.member(msg.mentions.users.first()))) return msg.channel.send(`You do not have the necessary permissions to ban **${msg.mentions.users.first().username}**.`);

        for (let user of msg.mentions.users.values()) {
            if (msg.guild.members.has(user.id) && utils.determinePermissions(msg.member) > utils.determinePermissions(msg.guild.member(user)));
            {
                toBebanned.push(msg.guild.member(user));
            }
        }

        if (toBebanned.length === 0) msg.channel.send("No members are eligible to be banned.");
        else banList(toBebanned)
            .then(banned => {
                msg.channel.send({ embed: constructEmbed(banned, msg.author) });
            }).catch(console.error);
    }

    else
    {
        let toBeBanned = []
        , userIds = msg.args;
        for (let id of userIds) {
            if (msg.guild.members.has(id) && utils.determinePermissions(msg.member) > utils.determinePermissions(msg.guild.members.get(id)))
            {
                toBeBanned.push(msg.guild.members.get(id));
            }
        }

        if (toBeBanned.length === 0) msg.channel.send("No members are eligible to be banned.");
        else banList(toBeBanned)
            .then(banned => {
                msg.channel.send({ embed: constructEmbed(banned, msg.author) });
            }).catch(console.error);
    }
};

module.exports = ban;
