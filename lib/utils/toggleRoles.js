const Discord = require("discord.js");

function toggleRoles(doToggle, roles)
{
    return new Promise(function(resolve, reject)
    {
        if (!doToggle) return resolve(roles);
        if (!roles) return reject("No roles provided.");

        if (roles instanceof Discord.Role) roles = [roles];
        if (!Array.isArray(roles) || roles instanceof Discord.Collection) roles = roles.array();
        roles = roles.filter(r => r instanceof Discord.Role);

        if (!roles.length) return resolve(roles);

        for (let i = 0; i < roles.length; i++)
        {
            let role = roles[i];

            role.setMentionable(!role.mentionable)
                .then(function()
                {
                    if (i === roles.length - 1)
                        resolve(roles);
                }).catch(function(err)
                {
                    console.error(err);
                    if (i === roles.length - 1)
                        resolve(roles);
                });
        }
    });
}

module.exports = toggleRoles;
