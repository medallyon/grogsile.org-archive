function toggleRoles(doToggle, roles)
{
    return new Promise(function(resolve, reject)
    {
        if (!doToggle) return resolve(roles);
        if (!roles.length) return resolve(roles);

        if (roles instanceof Discord.Collection) roles = roles.array();
        roles = roles.filter(r => r instanceof Discord.Role);

        for (let i = 0; i < roles.length; i++)
        {
            let role = roles[i];

            role.setMentionable(!role.mentionable)
            .then(newRole => {
                if (i === roles.length - 1)
                {
                    resolve(roles);
                }
            }).catch(err => {
                console.error(err);
                if (i === roles.length - 1)
                {
                    resolve(roles);
                }
            });
        }
    });
}

module.exports = toggleRoles;
