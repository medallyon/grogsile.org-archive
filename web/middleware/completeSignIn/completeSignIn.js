const request = require("request");

const DISCORD_ENDPOINT = "https://discordapp.com/api/v6"

function fetchUser(accessData)
{
    return new Promise(function(resolve, reject)
    {
        let requestOptions = {
            uri: `${DISCORD_ENDPOINT}/users/@me`,
            headers: { Authorization: `${accessData.token_type} ${accessData.access_token}` }
        };

        request(requestOptions, function(err, response, user)
        {
            if (err) reject(err);
            else resolve(JSON.parse(user));
        });
    });
}

function fetchUserGuilds(accessData)
{
    return new Promise(function(resolve, reject)
    {
        let requestOptions = {
            uri: `${DISCORD_ENDPOINT}/users/@me/guilds`,
            headers: { Authorization: `${accessData.token_type} ${accessData.access_token}` }
        };

        request(requestOptions, function(err, response, guilds)
        {
            if (err) reject(err);
            else resolve(JSON.parse(guilds));
        });
    });
}

function completeSignIn(req, res, next)
{
    let requestOptions = {
        uri: `${DISCORD_ENDPOINT}/oauth2/token`,
        method: "POST",
        form: {
            "client_id": dClient.config.discord.auth.id,
            "client_secret": dClient.config.discord.auth.secret,
            "grant_type": "authorization_code",
            "code": req.query.code,
            "redirect_uri": `https://${req.hostname}/callback`
        }
    };

    request(requestOptions, function(err, response, body)
    {
        if (err) throw err;

        let accessData = JSON.parse(body);

        if (req.hostname === "bot.grogsile.org")
        {
            fetchUser(accessData).then(function(user)
            {
                fetchUserGuilds(accessData).then(function(guilds)
                {
                    req.session.user = user;
                    req.session.user.guilds = guilds;
                    req.session.user.logout = function()
                    {
                        req.session.user = null;
                    }

                    next();
                }).catch(function(err)
                {
                    console.error(err);
                    res.json(err);
                });
            }).catch(function(err)
            {
                console.error(err);
                res.json(err);
            });
        } else

        if (req.hostname === "esoi.grogsile.org")
        {
            fetchUser(accessData).then(function(user)
            {
                req.session.user = user;
                req.session.user.logout = function()
                {
                    req.session.user = null;
                }

                next();
            }).catch(function(err)
            {
                console.error(err);
                res.json(err);
            });
        }
    });
}

module.exports = completeSignIn;
