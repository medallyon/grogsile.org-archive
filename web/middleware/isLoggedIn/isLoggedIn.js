function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) next();
    else res.redirect(`/actuallylogin`);
}

module.exports = isLoggedIn;
