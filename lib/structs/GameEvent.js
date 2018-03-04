const Discord = require("discord.js");

class GameEvent
{
    constructor(owner, date, notifChannel, title = "", participants = new Discord.Collection())
    {
        if ((typeof date) === "string" || (typeof date) === "number") date = new Date(date);
        if (!(date instanceof Date)) throw new TypeError("{date} must be an instance of Date");
        this.date = date;

        if (!(owner instanceof Discord.GuildMember)) throw new TypeError("{owner} must be an instance of Disord.GuildMember");
        this.owner = owner;
        this.guild = this.owner.guild;

        if (this.guild.events) this.guild.events.push(this);
        else this.guild.events = [ this ];

        if (!title) this.title = `${this.owner.displayName}'s Event`;
        else this.title = title;

        if ((typeof notifChannel) === "string") notifChannel = dClient.channels.get(notifChannel);
        if (!(notifChannel instanceof Discord.GuildChannel)) throw new TypeError("{notifChannel} must be an instance of Discord.GuildChannel");
        this.channel = notifChannel;

        if (Array.isArray(participants))
        {
            if (participants.every(x => (typeof x) === "string")) participants.map(id => owner.guild.members.get(id));
            participants = new Discord.Collection(participants.filter(x => x instanceof Discord.GuildMember).map(m => [m.id, m]));
        }

        this.members = participants.set(this.owner.id, this.owner);

        let data = {
            name: this.title,
            color: dClient.modules.utils.randColor()
        }
        this.guild.createRole({ data, reason: `Role for ${this.title}` }).then(function(role)
        {
            dClient.setTimeout(function()
            {
                this.channel.send(`${this.createMemberMentionString}, \`${this.title} starts in **1 Hour**\`!`, { embed: this.embed }).catch(console.error);
            }, Date.parse(this.date) - Date.now());
        }).catch(function(err)
        {
            this.destroy("Failed to create Event Role. Aborting Event Creation\n." + err);
        });
    }

    destroy(err)
    {
        this.guild.events.splice(this.guild.events.findIndex(e => e === this), 1);
        console.error(err);
    }

    createMemberString()
    {
        let memberString = this.members.array().slice(0, this.members.size - 1).map(m => m.displayName).join(", ");
        if (this.members.size > 1) memberString += `${(this.members.size > 2) ? "," : ""} and ${this.members.last().displayName}`;
        else if (this.members.size === 1) memberString += this.members.first().displayName;;

        return memberString;
    }

    createMemberMentionString()
    {
        let memberMentions = this.members.array().slice(0, this.members.size - 1).map(m => m.toString()).join(", ");
        if (this.members.size > 1) memberMentions += `${(this.members.size > 2) ? "," : ""} and ${this.members.last().toString()}`;
        else if (this.members.size === 1) memberMentions += this.members.first().toString();

        return memberMentions;
    }

    get embed()
    {
        let description;
        if (this.members.size > 1) description = `**${this.members.size}** ${(this.members.size === 1) ? "member has" : "members have"} joined so far:\n${this.createMemberMentionString()}`;
        else description = `\nNo other members are taking part in this event yet.`;

        return new Discord.MessageEmbed()
            .setColor(dClient.modules.utils.randColor())
            .setAuthor(`${this.owner.displayName}'s Event`, this.owner.user.displayAvatarURL())
            .setTitle(this.title)
            .setDescription(`This is ${this.owner.toString()}'s Event. ${description}`)
            .setFooter(constants.discord.embed.footer.text, constants.discord.embed.footer.icon_url);
    }

    remind()
    {
        return this.channel.send(`Hey, ${this.createMemberMentionString()}, your event will start in ${dClient.modules.utils.timeSince(this.date)}!`);
    }

    add(member)
    {
        if (!(member instanceof Discord.GuildMember)) throw new TypeError("{member} must be an instance of Discord.GuildMember");
        if (this.members.size < 24)
        {
            if (!this.members.has(member.id)) this.members.set(member.id, member);
        }

        return this;
    }

    remove(member)
    {
        if (!(member instanceof Discord.GuildMember)) throw new TypeError("{member} must be an instance of Discord.GuildMember");
        if (this.members.size > 1)
        {
            if (this.members.has(member.id) && this.owner.id !== member.id) this.members.delete(member.id);
        }

        return this;
    }
}

module.exports = GameEvent;
