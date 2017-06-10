const Discord = require("discord.js");

// a 'Party' exceeds the same functionality as a Discord.js Collection (extended from a Node Map)
class Party extends Discord.Collection
{
    // takes 1 optional argument:
    // {users} - 2D Array of existing Discord.js Members
    constructor(users)
    {
        if (typeof users !== "undefined") super(users);
        else super();

        this.set("leader", this.first());
    }

    // shorthand for 'this.get("leader")'
    get leader()
    {
        return this.get("leader");
    }

    // returns an embed showing all members
    get partyEmbed()
    {
        let embed = new Discord.RichEmbed()
            .setColor(utils.randColor())
            .setAuthor(`${this.leader.username}#${this.leader.discriminator}'s Party`, this.leader.displayAvatarURL)
            .setDescription(`This Party consists of ${this.size - 1} member${(this.size - 1 > 1) ? "s" : ""}.`)
            .setFooter("Brought to you by Grogsile Inc.", dClient.user.displayAvatarURL);

        // where member = [key, value]
        for (let member of this.entries())
        {
            if (member[0] !== "leader") embed.addField(`${member[1].username}#${member[1].discriminator}${(this.leader.id === member[1].id ? " (Leader)" : "")}`, "\u200b", true);
        }

        return embed;
    }

    // invites a user and awaits their input / decision
    invite(user)
    {
        this.leader.send(`You have sent **${user.username}**#${user.discriminator} an invite to your Party. Waiting for them to accept or decline...`);
        user.send(`**${this.leader.username}**#${this.leader.discriminator} sends you an invite to their Party, consisting of the following members:`, { embed: this.partyEmbed })
        .then(msg => {
            user.send("Do You Accept?")
            .then(decisionMsg => {
                decisionMsg.react("✖").then(declineReaction => { decisionMsg.react("✔")
                    .then(acceptReaction => {
                        decisionMsg.awaitReactions(((reaction, reactor) => ["✔", "✖"].some(y => y === reaction.emoji.name) && reactor.id === user.id), { max: 1, time: 60 * 1000, errors: ["time"] })
                        .then(reactions => {
                            if (reactions.first().emoji.name === "✔")
                            {
                                this.add(user);

                                let latestPartyEmbed = this.partyEmbed;

                                this.leader.send(`**${user.username}**#${user.discriminator} has accepted your Party invite! Your Party now consists of the following members:`, { embed: latestPartyEmbed });
                                user.send(`You have successfully accepted **${this.leader.username}**#${this.leader.discriminator}'s invite. The Party now consists of the following members:`, { embed: latestPartyEmbed });
                            }

                            else
                            {
                                this.leader.send(`**${user.username}**#${user.discriminator} has declined your Party invite.`);
                                user.send(`You have successfully declined **${this.leader.username}**#${this.leader.discriminator}'s invite.`);
                            }
                        }).catch(collected => {
                            this.leader.send(`**${user.username}**#${user.discriminator} took too long to respond.`);
                            user.send(`You took too long to respond to **${this.leader.username}**#${this.leader.discriminator}'s invite.`);
                        });
                    });
                });
            });
        });
    }

    // adds a user to this Party
    add(user)
    {
        if (!this.has(user.id)) this.set(user.id, user);
    }

    // kicks a user from this Party
    kick(user)
    {
        if (this.has(user.id)) this.delete(user.id);
    }
}

module.exports = Party;
