function updateMemberNickname(member)
{
    dClient.libs.fs.access(dClient.libs.join(__data, "users", member.id, "account.json"), function(err)
    {
        if (err && err.code === "ENOENT") return;
        else if (err) return console.error(err);

        dClient.libs.fs.readJson(dClient.libs.join(__data, "users", member.id, "account.json")).then(function(account)
        {
            let nickname = member.displayName, prefix;
            if (account.nickname)
            {
                let newPrefix = `[${account.platform}] `;
                if (account.platform === "XBOne") newPrefix = `[XB1] `;

                if (/\[(?:PC|XB1|PS4)\] /g.test(nickname))
                {
                    prefix = /(\[(?:PC|XB1|PS4)\] )/g.exec(nickname)[1];
                    nickname = nickname.replace(prefix, newPrefix);
                } else nickname = newPrefix + nickname;
            } else

            if (!account.nickname)
            {
                if (/\[(?:PC|XB1|PS4)\] /g.test(nickname))
                {
                    prefix = /(\[(?:PC|XB1|PS4)\] )/g.exec(nickname)[1];
                    nickname = nickname.replace(prefix, "");
                }
            }

            member.setNickname(nickname, "Web Account Nickname Update").catch(console.error);
        }).catch(console.error);
    });
}

function guildMemberUpdate(oldMember, newMember)
{
    if (dClient.eso.guild.members.has(newMember.id) && oldMember.displayName !== newMember.displayName) updateMemberNickname(newMember);
}

module.exports = guildMemberUpdate;
