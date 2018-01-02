function isLoggedIn(req, res, next)
{
    if (req.session.user) next();
    else res.redirect(`/actuallylogin`);
}

module.exports = isLoggedIn;
