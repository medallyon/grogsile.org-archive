function isAccountSetup(req, res, next)
{
    fs.readJson(join(__data, "users", req.user.id, "account.json"), (err, account) => {
        if (err) return res.send(err);

        if (account.accountName === "undefined") res.redirect("/account");
        else next();
    });
}

module.exports = isAccountSetup;
