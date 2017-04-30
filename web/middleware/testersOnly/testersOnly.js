function testersOnly(req, res, next)
{
    let esoiGuild = dClient.guilds.get("130716876937494528");

    if (req.user)
    {
        if (esoiGuild.members.has(req.user.id))
        {
            let member = esoiGuild.members.get(req.user.id);
            if (member.roles.exists("name", "Tester")) next();
            else res.send("Sorry, this feature is not yet available for non-testers. Meanwhile, why not chat on the <a href='/discord'>ESOI Discord</a>?");
        } else res.send("Sorry, this feature is not yet available for non-testers. Meanwhile, why not chat on the <a href='/discord'>ESOI Discord</a>?");
    } else res.send(`Sorry, this feature is not yet available for non-testers. You could try <a href="/login">logging in</a>. Meanwhile, why not chat on the <a href="/discord">ESOI Discord</a>?`);
}

module.exports = testersOnly;
