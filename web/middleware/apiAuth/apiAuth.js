function apiAuth(req, res, next)
{
    if (req.originalUrl.indexOf("@me") > -1 && req.session.user) return next();
    else if (req.originalUrl.indexOf("@me") > -1 && !req.session.user) return res.status(400).send("You may not request @me data without being authenticated.");

    dClient.libs.fs.readJson(dClient.libs.join(__dirname, "keys.json"), function(err, keys)
    {
        if (err) console.error(err);

        let apiKey;
        if (req.body.key) apiKey = req.body.key;
        else if (req.query.key) apiKey = req.query.key;
        else apiKey = req.get("Authorization") || req.get("Authorisation");

        if (apiKey && keys.some(key => key === apiKey)) return next();
        else return res.status(401).send("Submitted none or wrong API key.");
    });
}

module.exports = apiAuth;
