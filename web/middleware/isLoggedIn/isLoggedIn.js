function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) next();
    else res.redirect(`https://esoi.grogsile.me/actuallylogin`);
}

module.exports = isLoggedIn;
