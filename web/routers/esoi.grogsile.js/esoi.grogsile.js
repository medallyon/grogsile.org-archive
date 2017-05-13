const Discord = require("discord.js")
, express = require("express")
, multer = require("multer")
, jimp = require("jimp")
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
    scope: ["identify"]
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

router.get("/login", middleware.isLoggedIn, function(req, res)
{
    res.redirect("/dashboard");
});

router.get("/actuallylogin", passport.authenticate("discord", { scope: ["identify"] }), (req, res) => {});

router.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), function(req, res)
{
    let userDir = join(__data, "users", req.user.id);
    fs.readdir(userDir, (err, files) => {
        if (err) console.error(err);

        fs.outputJson(join(userDir, "user.json"), req.user, (err) => {
            if (err) console.error(err);

            if (files.indexOf("account.json") === -1)
            {
                fs.outputJson(join(userDir, "account.json"), _templates.account, (err) => {
                    if (err) console.error(err);

                    res.redirect("/dashboard");
                });
            } else res.redirect("/dashboard");
        });

        if (files.indexOf("characters.json") === -1) fs.outputJson(join(userDir, "characters.json"), {}, (err) => { if (err) console.error(err) });
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

// ===== [ HOME ] ===== //

router.get("/", resetLocals, function(req, res)
{
    if (!req.user) res.render("pages/cover.ejs", locals);
    else res.redirect("/dashboard");
});

// ===== [ DASHBOARD ] ===== //

router.get("/dashboard", middleware.isLoggedIn, middleware.isAccountSetup, resetLocals, function(req, res)
{
    let userDir = join(__data, "users", req.user.id);
    fs.readJson(join(userDir, "characters.json"), (err, characters) => {
        if (err) console.error(err);

        locals.characters = characters;
        res.render("pages/dashboard.ejs", locals);
    });
});

// ===== [ ACCOUNT ] ===== //

router.get("/account", middleware.isLoggedIn, resetLocals, function(req, res)
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

router.post("/account", middleware.isLoggedIn, resetLocals, function(req, res)
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
            alliance: req.body.alliance,
            private: ((req.body.private === "on") ? true : false)
        }, (err) => {
            if (err) {
                console.error(err);
                res.send("Something went wrong :/\nDo tell a developer over at <a href='https://esoi.grogsile.me/discord'>Discord</a>!");
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

router.get("/new", middleware.isLoggedIn, middleware.testersOnly, middleware.isAccountSetup, resetLocals, function(req, res)
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

// ===== [ PUBLIC PROFILE ] ===== //

router.get("/u/:id", middleware.testersOnly, resetLocals, function(req, res)
{
    fs.readdir(join(__data, "users"), (err, users) => {
        if (err) return res.send(err);

        if (users.indexOf(req.params.id) > -1)
        {
            fs.readJson(join(__data, "users", req.params.id, "account.json"), (err, account) => {
                if (err) return res.send(err);

                if (req.user && req.user.id === req.params.id && account.accountName === "undefined") return res.redirect("/account");

                if (account.accountName === "undefined")
                {
                    locals.error = {
                        title: "Profile not found",
                        description: `This profile could not be found. If you believe this is a mistake, talk to us on <a href="/discord">Discord</a>.`
                    };

                    return res.render("pages/error.ejs", locals);
                }

                locals.targetAccount = account;

                fs.readJson(join(__data, "users", req.params.id, "user.json"), (err, user) => {
                    if (err) return res.send(err);

                    locals.targetUser = user;

                    fs.readJson(join(__data, "users", req.params.id, "characters.json"), (err, characters) => {
                        if (err) return res.send(err);

                        locals.characters = characters;

                        if (account.private)
                        {
                            if (req.user && req.user.id === req.params.id) return res.render("pages/profile.ejs", locals);
                            else
                            {
                                locals.error = {
                                    title: `${user.username}#${user.discriminator}'s profile is private!`,
                                    description: `This profile has been set to private. If you think this is an error, speak to <b>${user.username}#${user.discriminator}</b> or a developer on <a href="/discord">Discord</a>.`
                                };

                                return res.render("pages/error.ejs", locals);
                            }
                        }

                        else res.render("pages/profile.ejs", locals);
                    });
                });
            });
        }

        else
        {
            locals.error = {
                title: "Profile not found",
                description: `This profile could not be found. If you believe this is a mistake, talk to us on <a href="/discord">Discord</a>.`
            };

            res.render("pages/error.ejs", locals);
        }
    });
});

// ===== [ ESOI END-POINTS ] ===== //

router.get("/api/users/:id/characters", middleware.apiAuth, function(req, res)
{
    const userId = (req.params.id === "@me" ? req.user.id : req.params.id);
    const userDir = join(__data, "users", userId);
    fs.access(userDir, (err) => {
        if (err && err.code === "ENOENT") return res.status(400).send("This user does not exist");
        else if (err) return res.status(500).send("Something went wrong while reading characters for this user");

        fs.readJson(join(userDir, "characters.json"), (err, characters) => {
            if (err) return res.status(500).send("Something went wrong while reading characters for this user");

            res.send(JSON.stringify(characters, null, 2));
        });
    });
});

function validateFormElements(form)
{
    if (form.characterName.length < 3 || form.characterName.length > 25) return res.status(400).send("Character Name length is out of bounds");
    if (/[^a-zA-Z-'öüäß ]/g.test(form.characterName)) return res.status(400).send("Character Name contains special characters");
    if ("abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ-'öüäß ".split("").some(x => form.characterName.includes(x*3))) return res.status(400).send("Character name contains a character three consecutive times");

    if (form.champion === "on") form.champion = true;
    else form.champion = false;

    if (!form.champion)
    {
        if (form.level > 49) form.champion = true;
    }

    if (form.biography.length > 500) return res.status(400).send("Biography is too long (max. 500 characters)");
}

// New Character POST Method
let upload = multer();
router.post("/api/users/:id/characters", middleware.apiAuth, upload.single("avatar"), function(req, res)
{
    console.log(req.body);

    if (!req.body) return res.status(400).send("No form data was sent with the request");

    const userId = (req.params.id === "@me" ? req.user.id : req.params.id);
    const userDir = join(__data, "users", userId);

    fs.access(userDir, (err) => {
        if (err && err.code === "ENOENT") return res.status(400).send("This user does not exist");
        else if (err) return res.status(500).send(err);

        fs.readJson(join(userDir, "characters.json"), (err, characters) => {
            if (err) return res.status(500).send("Cannot read characters from user");

            if (Object.keys(characters).length >= 12) return res.status(409).send("Characters are limited to 12 per user");

            validateFormElements(req.body)
            .then((charData) => {
                let character = charData;
                character.name = character.characterName;
                delete character.characterName;

                const userAvatarDir = join(__webdir, ".pub_src", "esoi", "users", userId);
                fs.ensureDir(userAvatarDir, (err) => {
                    if (err) return res.status(500).send("Could not establish user avatar directory");

                    if (!req.file) req.file = { buffer: join(__src, "esoi", "img", "new", "default_char.png") };
                    jimp.read(req.file.buffer).then(function(image)
                    {
                        const avatarData = JSON.parse(req.body.avatarData);
                        image.crop(avatarData.x, avatarData.y, avatarData.width, avatarData.height);

                        image.write(join(userAvatarDir, `${Object.keys(characters).length}.png`), (err) => {
                            if (err) return res.status(500).send("Cannot write avatar to file");

                            character.avatarURL = `https://i.grogsile.me/esoi/users/${userId}/${Object.keys(characters).length}.png`;
                            characters[Object.keys(characters).length] = character;

                            fs.writeJson(join(userDir, "characters.json"), characters, (err) => {
                                if (err) return res.status(500).send("Could not save character to file");

                                res.status(200).send(Object.assign(req.body, { statusCode: 200, statusMessage: "Success!" }));
                            });
                        });
                    }).catch(console.error);
                });
            })
            .catch(res.send);
        });
    });
});

// ===== [ DISCORD INVITE ] ===== //

router.get("/discord", function(req, res)
{
    res.redirect(dClient.config.eso.invite);
});

// ===== [ ROUTER EXPORT ] ===== //

module.exports = router;
