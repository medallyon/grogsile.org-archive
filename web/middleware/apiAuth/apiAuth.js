const fs = require("fs-extra")
, join = require("path").join;

function apiAuth(req, res, next)
{
    fs.readJson(join(__dirname, "keys.json"), (err, keys) => {
        if (err) console.error(err);

        let apiKey;
        if (req.body.key) apiKey = req.body.key;
        else if (req.query.key) apiKey = req.query.key;

        if (apiKey && keys.some(key => key === apiKey)) return next();
        else return res.status(401).send("Submitted none or wrong API key.");
    });
}

module.exports = apiAuth;
