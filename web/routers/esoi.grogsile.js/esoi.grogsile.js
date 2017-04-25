const Discord = require("discord.js")
, express = require("express")
, multer = require("multer")
, passport = require("passport")
, Strategy = require("passport-discord").Strategy
, session = require("express-session")
, fs = require("fs-extra")
, join = require("path").join;

let router = express.Router()
, locals = {};

// ===== [ DISCORD AUTH ] ===== //

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new Strategy({
    clientID: dClient.config.discord.auth.id,
    clientSecret: dClient.config.discord.auth.secret,
    callbackURL: "https://esoi.grogsile.me/callback",
    scope: ["identify", "guilds", "guilds.join"]
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
router.use(session({
    secret: utils.genSecret(),
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

router.get("/login", isLoggedIn, function(req, res)
{
    res.redirect("/dashboard");
});

router.get("/actuallylogin", passport.authenticate("discord", { scope: ["identify", "guilds", "guilds.join"] }), (req, res) => {});

router.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), function(req, res)
{
    let userDir = join(__data, "users", req.user.id)
    , continuePath = req.query.continue || "/dashboard";
    fs.readdir(join(__data, "users"), (err, files) => {
        if (err) console.error(err);

        fs.outputJson(join(userDir, "user.json"), req.user, (err) => {
            if (err) console.error(err);

            res.redirect(continuePath);
        });

        if (files.indexOf(req.user.id) === -1) fs.outputJson(join(userDir, "characters.json"), {}, (err) => { if (err) console.error(err) });
    });
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// ===== [ HELPER FUNCTIONS ] ===== //

function resetLocals(req, res, next)
{
    locals = {
        location: "",
        content: {},
        user: req.user || null,
        account: {}
    };
    
    if (req.user)
    {
        fs.readJson(join(__data, "users", req.user.id, "account.json"), (err, account) => {
            if (err) console.error(err);

            locals.account = account;
            next();
        });
    } else next();
}

function isLoggedIn(req, res, next)
{
    if (req.isAuthenticated()) next();
    else res.redirect(`/actuallylogin?continue=${req.originalUrl}`);
}

let testersOnly = require(join(__webdir, "middleware", "testersOnly", "testersOnly.js"))
, isAccountSetup = require(join(__webdir, "middleware", "isAccountSetup", "isAccountSetup.js"));

// ===== [ HOME ] ===== //

router.get("/", resetLocals, function(req, res)
{
    if (!req.user) res.render("pages/cover.ejs", locals);
    else res.redirect("/dashboard");
});

// ===== [ DASHBOARD ] ===== //

router.get("/dashboard", isLoggedIn, isAccountSetup, resetLocals, function(req, res)
{
    let userDir = join(__data, "users", req.user.id);
    fs.readJson(join(userDir, "characters.json"), (err, characters) => {
        if (err) console.error(err);

        locals.content.characters = characters;
        res.render("pages/dashboard.ejs", locals);
    });
});

// ===== [ ACCOUNT ] ===== //

router.get("/account", isLoggedIn, resetLocals, function(req, res)
{
    let userDir = join(__data, "users", req.user.id);
    fs.readdir(userDir, (err, files) => {
        if (err) console.error(err);

        if (files.indexOf("account.json") === -1)
        {
            fs.outputJson(join(userDir, "account.json"), _templates.account, (err) => {
                if (err) console.error(err);

                res.redirect("/account");
            });
        }

        else {
            fs.readJson(join(userDir, "account.json"), (err, account) => {
                if (err) console.error(err);

                locals.content.account = account;
                locals.content.success = false;
                res.render("pages/account.ejs", locals);
            });
        }
    });
});

router.post("/account", isLoggedIn, resetLocals, function(req, res)
{
    if (req.body)
    {
        let userDir = join(__data, "users", req.user.id);
        fs.outputJson(join(userDir, "account.json"), {
            accountName: req.body.accountName.replace(/\@/g, ""),
            champion: ((req.body.champion === "on") ? true : false),
            level: req.body.level,
            about: req.body.about,
            server: req.body.server,
            platform: req.body.platform,
            alliance: req.body.alliance
        }, (err) => {
            if (err) {
                console.error(err);
                res.send("Something went wrong :/\nDo tell the developers over at <a href='https://esoi.grogsile.me/discord'>Discord</a>!");
            }

            else {
                locals.content.account = req.body;
                locals.content.success = true;
                res.render("pages/account.ejs", locals);

                modules.addToEsoRank(req.user.id, req.body.server, req.body.platform, req.body.alliance);
            }
        });
    }
});

// ===== [ NEW CHARACTER | NEW GUILD ] ===== //

router.get("/new", isLoggedIn, testersOnly, isAccountSetup, resetLocals, function(req, res)
{
    if (!req.query.type) req.query.type = "character";

    if (req.query.type.toLowerCase() === "character")
    {
        res.render("pages/newChar.ejs", locals);
    } else

    if (req.query.type.toLowerCase() === "guild")
    {
        res.render("pages/newGuild.ejs", locals);
    }
});

router.post("/new", isLoggedIn, testersOnly, isAccountSetup, resetLocals, function(req, res)
{
    // body...
});

// ===== [ DISCORD INVITE ] ===== //

router.get("/discord", function(req, res)
{
    res.redirect(dClient.config.eso.invite);
});

module.exports = router;
