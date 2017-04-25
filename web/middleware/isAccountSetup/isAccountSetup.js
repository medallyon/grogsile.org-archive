const fs = require("fs-extra")
, join = require("path").join;

function isAccountSetup(req, res, next)
{
    fs.readdir(join(__data, "users", req.user.id), (err, files) => {
        if (err) console.error(err);

        if (files.indexOf("account.json") > -1) next();
        else res.redirect("/account");
    });
}

module.exports = isAccountSetup;
