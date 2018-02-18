function updateMemberNickname(member)
{
    fs.readJson(join(__data, "users", member.id, "account.json")).then(function(account)
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
}

function guildMemberUpdate(oldMember, newMember)
{
    if (_esoi.guild.members.has(newMember.id) && oldMember.displayName !== newMember.displayName) updateMemberNickname(newMember);
}

module.exports = guildMemberUpdate;
