const numberEmojis = new Discord.Collection([
    [ 1, "1⃣" ],
    [ 2, "2⃣" ],
    [ 3, "3⃣" ],
    [ 4, "4⃣" ],
    [ 5, "5⃣" ],
    [ 6, "6⃣" ],
    [ 7, "7⃣" ],
    [ 8, "8⃣" ],
    [ 9, "9⃣" ],
    [ 10, "🔟" ]
]);

let addReactions = {
    stopped: false,

    init: function(message, from, to)
    {
        if (!this.stopped)
        {
            message.react(numberEmojis.get(from + 1))
            .then(reaction => {
                if (from < to) addReactions.init(message, from + 1, to);
            }).catch(err => {
                console.error(err);
                if (from < to) addReactions.init(message, from + 1, to);
            });
        }
    },

    stop: function()
    {
        this.stopped = true;
    }
}

// resolves an ambigious numberEmoji to a number
function resolveEmoji(emoji)
{
    if (emoji instanceof Discord.MessageReaction) emoji = emoji.emoji.toString();
    for (const e of numberEmojis.entries())
    {
        if (e[1] === emoji) return e[0];
    }
}

function awaitUserReactionFor(msg, embed, amount)
{
    addReactions.stopped = false;
    return new Promise(function(resolve, reject)
    {
        msg.channel.send({ embed })
        .then(function(message)
        {
            addReactions.init(message, 0, amount - 1);

            const reactionFilter = function(r, u)
            {
                return (u.id === msg.author.id && numberEmojis.exists(e => e === r.emoji.toString()));
            };

            message.awaitReactions(reactionFilter, { max: 1, time: 1000 * 45, errors: ["time"] })
                .then(function(reactions)
                {
                    addReactions.stop();
                    dClient.setTimeout(() => { message.reactions.removeAll().catch(console.error) }, 1000 * 3);
                    resolve([resolveEmoji(reactions.first()), message]);
                }).catch(function(collection, reason)
                {
                    dClient.setTimeout(() => { message.reactions.removeAll().catch(console.error) }, 1000 * 3);
                    reject([reason, message]);
                });
        }).catch(reject);
    });
}

function curateFieldValue(value, length = 50)
{
    if (value.length === 0) value = "\u200b";
    else if (value.length > length) value = value.slice(0, length) + "...";

    return value;
}

function createSelectorEmbed(msg, items, options = null, callback = null)
{
    let data = [], embed;
    if (options)
    {
        if (options instanceof Discord.MessageEmbed) embed = options;
        else if (Array.isArray(options)) data = options;
        else
        {
            for (let x in options) data.push([x, options[x]]);
        }

        if (!embed) embed = new Discord.MessageEmbed(data);
    } else embed = new Discord.MessageEmbed()
        .setColor(utils.randColor())
        .setAuthor("Item Selector", msg.author.displayAvatarURL())
        .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);

    if (items.length > 10) items = items.slice(0, 10);

    for (let i = 0; i < items.length; i++)
    {
        embed.addField(`${i+1}. ${items[i].name}`, curateFieldValue(items[i].value, options.fieldValueLength), true);
    }

    if (callback && (typeof callback) === "function") embed = callback(embed);

    embed.addField("\u200b", "**Please select one of the following emoji to select the relative item.**", false);

    return awaitUserReactionFor(msg, embed, items.length);
}

module.exports = createSelectorEmbed;
