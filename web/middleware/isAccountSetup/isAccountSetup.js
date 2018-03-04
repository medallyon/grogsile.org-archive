function isAccountSetup(req, res, next)
{
    dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.session.user.id, "account.json"), function(err, account)
    {
        if (err) return res.send(err.message);

        if (account.accountName === "undefined") res.redirect("/account");
        else next();
    });
}

module.exports = isAccountSetup;
