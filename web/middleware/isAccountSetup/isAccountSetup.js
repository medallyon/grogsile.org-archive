function isAccountSetup(req, res, next)
{
    fs.readJson(join(__data, "users", req.session.user.id, "account.json"), (err, account) => {
        if (err) return res.send(err.message);

        if (account.accountName === "undefined") res.redirect("/account");
        else next();
    });
}

module.exports = isAccountSetup;
