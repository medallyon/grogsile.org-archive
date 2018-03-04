const request = require("request");

const DISCORD_ENDPOINT = "https://discordapp.com/api/v6";

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
            "client_id": dClient.config.web.discord.auth.key,
            "client_secret": dClient.config.web.discord.auth.secret,
            "grant_type": "authorization_code",
            "code": req.query.code,
            "redirect_uri": `https://${req.hostname}/callback`
        }
    };

    request(requestOptions, function(err, response, body)
    {
        if (err) throw err;

        let accessData = JSON.parse(body);
        console.log(accessData);

        if (accessData.error)
        {
            if (accessData.error === "invalid_request") return res.redirect("/");
            else return res.status(500).send(`<p>We couldn't authenticate you. :/ ERROR MESSAGE: ${accessData.error}</p><p>Go back to <a href="https://esoi.grogsile.org/">ESO International</a></p>`);
        }

        if (req.hostname === "bot.grogsile.org")
        {
            fetchUser(accessData).then(function(user)
            {
                fetchUserGuilds(accessData).then(function(guilds)
                {
                    req.session.user = user;
                    req.session.user.guilds = guilds;

                    next();
                }).catch(function(err)
                {
                    console.error(err);
                    res.redirect("/");
                });
            }).catch(function(err)
            {
                console.error(err);
                res.redirect("/");
            });
        } else

        if (req.hostname === "esoi.grogsile.org")
        {
            fetchUser(accessData).then(function(user)
            {
                req.session.user = user;

                next();
            }).catch(function(err)
            {
                console.error(err);
                res.redirect("/");
            });
        }
    });
}

module.exports = completeSignIn;
