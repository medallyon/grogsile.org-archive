const EventEmitter = require("events");

class ESOI extends EventEmitter
{
    constructor(guildId)
    {
        super();

        this.guild = dClient.guilds.get(guildId);
        this.guild.webListener = this;

        fs.readdir(join(__botdir, "handlers", "esoi")).then(function(handlers)
        {
            for (const handler of handlers) require(join(__botdir, "handlers", "esoi", handler));
        }).catch(console.error);
    }

    fetchAccount(member)
    {
        return new Promise(function(resolve, reject)
        {
            if (member instanceof Discord.GuildMember || member instanceof Discord.User) member = member.id;
            else if ((typeof member) !== "string") return reject(new TypeError("Member parameter must be a String"));

            fs.readdir(join(__data, "users")).then(function(files)
            {
                let userDir = join(__data, "users", member);
                if (files.indexOf(member) == -1) return reject(new ReferenceError(`Member ${member} is not part of data`));

                fs.readJson(join(userDir, "account.json")).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    fetchCharacters(member)
    {
        return new Promise(function(resolve, reject)
        {
            if (member instanceof Discord.GuildMember || member instanceof Discord.User) member = member.id;
            else if ((typeof member) !== "string") return reject(new TypeError("Member parameter must be a String"));

            fs.readdir(join(__data, "users")).then(function(files)
            {
                let userDir = join(__data, "users", member);
                if (files.indexOf(member) == -1) return reject(new ReferenceError(`Member ${member} is not part of data`));

                fs.readJson(join(userDir, "characters.json")).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    addMemberToAlliance(member, alliance)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!alliance) throw new TypeError(`Alliance needs to be one or more of '${constants.discord.esoi.roles["Aldmeri Dominion"]}', '${constants.discord.esoi.roles["Daggerfall Covenant"]}', or '${constants.discord.esoi.roles["Ebonheart Pact"]}'`);

        if (Array.isArray(alliance))
        {
            alliance = alliance.map(a => this.guild.roles.get(a));
            alliance = alliance.filter(a => a !== undefined);

            if (!alliance.length) console.info(`No roles to add to member ${member.user.username}`);
            else return member.roles.add(alliance);
        }

        else
        {
            alliance = this.guild.roles.get(alliance);
            if (!alliance) console.info(`Cannot find role on server`);
            else return member.roles.add(alliance);
        }
    }

    removeMemberFromAlliance(member, alliance)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!alliance) throw new TypeError(`Alliance needs to be one or more of '${constants.discord.esoi.roles["Aldmeri Dominion"]}', '${constants.discord.esoi.roles["Daggerfall Covenant"]}', or '${constants.discord.esoi.roles["Ebonheart Pact"]}'`);

        if (Array.isArray(alliance))
        {
            alliance = alliance.map(a => this.guild.roles.get(a));
            alliance = alliance.filter(a => a !== undefined);

            if (!alliance.length) console.info(`No roles to add to member ${member.user.username}`);
            else return member.roles.remove(alliance);
        }

        else
        {
            alliance = this.guild.roles.get(alliance);
            if (!alliance) console.info(`Cannot find role on server`);
            else return member.roles.remove(alliance);
        }
    }

    addMemberToServer(member, server)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!server) throw new Error(`Server needs to be one of '${constants.discord.esoi.roles["EU"]}' or '${constants.discord.esoi.roles["NA"]}'`);

        if ((typeof server) !== "string") throw new TypeError("Server must be a string");
        if (!server) throw new TypeError("Server must not be undefined");

        server = this.guild.roles.get(server);
        if (!server) console.info("Cannot find role on server");
        else return member.roles.add(server);
    }

    removeMemberFromServer(member, server)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!server) throw new Error(`Server needs to be one of '${constants.discord.esoi.roles["EU"]}' or '${constants.discord.esoi.roles["NA"]}'`);

        if ((typeof server) !== "string") throw new TypeError("Server must be a string");
        if (!server) throw new TypeError("Server must not be undefined");

        server = this.guild.roles.get(server);
        if (!server) console.info("Cannot find role on server");
        else return member.roles.remove(server);
    }

    addMemberToPlatform(member, platform)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!platform) throw new Error(`Platform needs to be one of '${constants.discord.esoi.roles["PC"]}', '${constants.discord.esoi.roles["PS4"]}', or '${constants.discord.esoi.roles["XBOne"]}'`);

        if ((typeof platform) !== "string") throw new TypeError("Platform must be a string");
        if (!platform) throw new TypeError("Platform must not be undefined");

        platform = this.guild.roles.get(platform);
        if (!platform) console.info("Cannot find role on server");
        else return member.roles.add(platform);
    }

    removeMemberFromPlatform(member, platform)
    {
        if ((typeof member) === "string") member = this.guild.members.get(member);
        if (!member) return console.warn(`Member with ID ${member} is not present on ESOI`);

        if (!platform) throw new Error(`Platform needs to be one of '${constants.discord.esoi.roles["PC"]}', '${constants.discord.esoi.roles["PS4"]}', or '${constants.discord.esoi.roles["XBOne"]}'`);

        if ((typeof platform) !== "string") throw new TypeError("Platform must be a string");
        if (!platform) throw new TypeError("Platform must not be undefined");

        platform = this.guild.roles.get(platform);
        if (!platform) console.info("Cannot find role on server");
        else return member.roles.remove(platform);
    }
}

module.exports = ESOI;
