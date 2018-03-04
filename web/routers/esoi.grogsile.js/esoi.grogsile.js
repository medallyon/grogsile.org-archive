const express = require("express")
, session = require("express-session")
, multer = require("multer")
, jimp = require("jimp")
, Grant = require("grant-express")
, Discord = require("discord.js");
let grant = new Grant(require(dClient.libs.join(__webdir, "config.json")));
const FileStore = require("session-file-store")(session);

let router = express.Router()
, locals = {};

// ===== [ DISCORD AUTH ] ===== //

router.use(session({
    secret: dClient.config.web.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { path: "/", httpOnly: false, secure: false, maxAge: 864000000 },
    store: new FileStore({ path: dClient.libs.join(__data, "sessions") })
}));
router.use(grant);

router.get("/login", dClient.middleware.isLoggedIn, function(req, res)
{
    res.redirect("/");
});

router.get("/actuallylogin", function(req, res)
{
    res.redirect("https://discordapp.com/api/oauth2/authorize?client_id=231606856663957505&redirect_uri=https%3A%2F%2Fesoi.grogsile.org%2Fcallback&response_type=code&scope=identify");
});

router.get("/callback", dClient.middleware.completeSignIn, function(req, res)
{
    if (!req.session.user)
    {
        console.error("Session User does not exist");
        return res.redirect("/");
    }

    let userDir = dClient.libs.join(__data, "users", req.session.user.id);
    dClient.libs.fs.ensureDir(userDir, function(err)
    {
        if (err) console.error(err);

        dClient.libs.fs.readdir(userDir, function(err, files)
        {
            if (err) console.error(err);

            dClient.libs.fs.outputJson(dClient.libs.join(userDir, "user.json"), req.session.user, function(err)
            {
                if (err) console.error(err);

                if (files.indexOf("characters.json") === -1) dClient.libs.fs.outputJson(dClient.libs.join(userDir, "characters.json"), [], (err) => { if (err) console.error(err) });
                if (files.indexOf("account.json") === -1)
                {
                    let userAccount = JSON.parse(JSON.stringify(dClient.config.templates.account));
                    userAccount.id = req.session.user.id;

                    dClient.libs.fs.outputJson(dClient.libs.join(userDir, "account.json"), userAccount, function(err)
                    {
                        if (err) console.error(err);

                        res.redirect("/dashboard");
                    });
                } else res.redirect("/dashboard");
            });
        });
    });
});

router.get("/logout", function(req, res)
{
    if (req.session.user) delete req.session.user;
    res.redirect("/");
});

// ===== [ HELPER FUNCTIONS ] ===== //

function resetLocals(req, res, next)
{
    if (req.session.user) req.user = req.session.user;

    let webApp = dClient.webApps["esoi.grogsile.org"];
    res.render = function(view, _locals)
    {
        webApp.render(view, { _locals }, function(err, htmlString)
        {
            if (err) throw err;
            else res.send(htmlString);
        });
    };

    locals = {
        location: "",
        content: {},
        user: req.user || null,
        account: {}
    };

    if (locals.user)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.user.id, "account.json"), function(err, account)
        {
            if (err) console.error(err);

            locals.account = account;
            next();
        });
    } else next();
}

// ===== [ HOME ] ===== //

router.get("/", resetLocals, function(req, res)
{
    if (!req.session.user) res.render("pages/cover.ejs", locals);
    else res.redirect("/dashboard");
});

// ===== [ DASHBOARD ] ===== //

router.get("/dashboard", dClient.middleware.isLoggedIn, resetLocals, dClient.middleware.isAccountSetup, function(req, res)
{
    let userDir = dClient.libs.join(__data, "users", req.user.id);
    dClient.libs.fs.readJson(dClient.libs.join(userDir, "characters.json"), function(err, characters)
    {
        if (err) console.error(err.message);

        locals.characters = characters;
        res.render("pages/dashboard.ejs", locals);
    });
});

// ===== [ ACCOUNT ] ===== //

router.get("/account", dClient.middleware.isLoggedIn, resetLocals, function(req, res)
{
    let userDir = dClient.libs.join(__data, "users", req.user.id);
    dClient.libs.fs.readdir(userDir, function(err, files)
    {
        if (err) return console.error(err);

        if (files.indexOf("account.json") === -1)
        {
            dClient.libs.fs.outputJson(dClient.libs.join(userDir, "account.json"), dClient.config.templates.account, function(err)
            {
                if (err) console.error(err);

                res.redirect("/account");
            });
        }

        else
        {
            dClient.libs.fs.readJson(dClient.libs.join(userDir, "account.json"), function(err, account)
            {
                if (err) console.error(err);

                locals.content.account = account;
                locals.content.success = false;
                res.render("pages/account.ejs", locals);
            });
        }
    });
});

router.post("/account", dClient.middleware.isLoggedIn, resetLocals, function(req, res)
{
    if (req.body)
    {
        let userDir = dClient.libs.join(__data, "users", req.user.id);
        dClient.libs.fs.readJson(dClient.libs.join(userDir, "account.json")).then(function(acc)
        {
            let oldAccount = JSON.parse(JSON.stringify(acc));
            let newAccount = {
                id: req.user.id,
                accountName: req.body.accountName.replace(/@/g, ""),
                champion: ((req.body.champion === "on") ? true : false),
                level: req.body.level,
                about: req.body.about,
                server: req.body.server,
                platform: req.body.platform,
                alliance: req.body.alliance || null,
                private: ((req.body.private === "on") ? true : false),
                updates: ((req.body.updates === "on") ? true : false),
                news: ((req.body.news === "on") ? true : false),
                nickname: ((req.body.nickname === "on") ? true : false)
            };

            dClient.libs.fs.outputJson(dClient.libs.join(userDir, "account.json"), newAccount).then(function()
            {
                locals.content.account = req.body;
                locals.content.success = true;
                res.render("pages/account.ejs", locals);

                dClient.eso.emit("accountUpdate", oldAccount, newAccount);
            }).catch(function(err)
            {
                console.error(err);
                res.send("Something went wrong :/\nDo tell a developer over at <a href='https://esoi.grogsile.org/discord'>Discord</a>!");
            });
        }).catch(function(err)
        {
            console.error(err);
            res.send("Something went wrong :/\nDo tell a developer over at <a href='https://esoi.grogsile.org/discord'>Discord</a>!");
        });
    }
});

// ===== [ NEW CHARACTER | NEW GUILD ] ===== //

router.get("/new", dClient.middleware.isLoggedIn, resetLocals, dClient.middleware.isAccountSetup, function(req, res)
{
    if (!req.query.type) req.query.type = "character";

    if (req.query.type.toLowerCase() === "character") res.render("pages/newChar.ejs", locals);
    else if (req.query.type.toLowerCase() === "guild") res.render("pages/newGuild.ejs", locals);
    else res.redirect("/new?type=character");
});

// ===== [ EDIT CHARACTER | EDIT GUILD ] ===== //

router.get("/edit", dClient.middleware.isLoggedIn, resetLocals, dClient.middleware.isAccountSetup, function(req, res)
{
    if (!req.query.type) req.query.type = "character";

    if (req.query.type.toLowerCase() === "character")
    {
        if (req.query.id)
        {
            locals.charId = req.query.id;
            dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.user.id, "characters.json"), function(err, characters)
            {
                if (err) return console.error(err);

                if (characters.hasOwnProperty(req.query.id)) locals.character = characters[req.query.id];
                else return res.status(400).send(`Cannot locate character with ID ${req.query.id}`);

                res.render("pages/editChar.ejs", locals);
            });
        }

        else res.status(400).send("Need to provide a parameter for character 'id'");
    } else

    if (req.query.type.toLowerCase() === "guild")
    {
        res.render("pages/editGuild.ejs", locals);
    } else res.redirect("/edit?type=character");
});

// ===== [ PUBLIC PROFILE ] ===== //

router.get("/u/:id", resetLocals, function(req, res)
{
    dClient.libs.fs.readdir(dClient.libs.join(__data, "users"), function(err, users)
    {
        if (err) return res.send(err);

        if (users.indexOf(req.params.id) > -1)
        {
            dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.params.id, "account.json"), function(err, account)
            {
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

                dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.params.id, "user.json"), function(err, user)
                {
                    if (err) return res.send(err);

                    locals.targetUser = user;

                    dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.params.id, "characters.json"), function(err, characters)
                    {
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

router.get("/api/users/:id", dClient.middleware.apiAuth, function(req, res)
{
    const userId = (req.params.id === "@me" ? req.session.user.id : req.params.id);

    dClient.libs.fs.readdir(dClient.libs.join(__data, "users"), function(err, users)
    {
        if (err) console.error(err);

        if (users.indexOf(userId) === -1) res.status(404).send("User not found");
        else
        {
            dClient.libs.fs.readJson(dClient.libs.join(__data, "users", userId, "account.json"), (err, account) => {
                if (err) console.error(err);

                res.json(account);
            });
        }
    });
});

router.get("/api/users/:id/characters", dClient.middleware.apiAuth, function(req, res)
{
    const userId = (req.params.id === "@me" ? req.session.user.id : req.params.id);
    const userDir = dClient.libs.join(__data, "users", userId);
    dClient.libs.fs.access(userDir, function(err)
    {
        if (err && err.code === "ENOENT") return res.status(400).send("This user does not exist");
        else if (err) return res.status(500).send("Something went wrong while reading characters for this user");

        dClient.libs.fs.readJson(dClient.libs.join(userDir, "characters.json"), function(err, characters)
        {
            if (err) return res.status(500).send("Something went wrong while reading characters for this user");

            res.send(JSON.stringify(characters, null, 2));
        });
    });
});

var ValidationError = class extends Error
{
    constructor(code, message = undefined, fileName = undefined, lineNumber = undefined)
    {
        super(message, fileName, lineNumber);
        this.code = code;
    }
};

function validateFormElements(form)
{
    delete form._method;
    return new Promise(function(resolve, reject)
    {
        // existence validation
        if (!form.primary) form.primary = false;
        if (!form.characterName) return reject(new ValidationError(400, "Submitted no Character Name"));
        if (!form.level) form.level = 0;
        if (!form.biography) form.biography = "";
        if (!form.alliance) return reject(new ValidationError(400, "Submitted no Alliance"));
        if (!form.class) return reject(new ValidationError(400, "Submitted no Class"));
        if (!form.race) return reject(new ValidationError(400, "Submitted no Race"));
        if (!form.roles) return reject(new ValidationError(400, "Submitted no Role(s)"));
        if (!form.professions) form.professions = [];

        // acceptance validation
        if (form.characterName.length < 3 || form.characterName.length > 25) return reject(new ValidationError(400, "Character Name length is out of bounds"));

        if (!/[a-zA-Z-'öüäß ]/g.test(form.characterName)) return reject(new ValidationError(400, "Character Name contains illegal characters"));

        if ("abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ-'öüäß ".split("").some(x => form.characterName.includes(x.repeat(3)))) return reject(new ValidationError(400, "Character name contains a character three consecutive times"));

        if (!["Aldmeri Dominion", "Daggerfall Covenant", "Ebonheart Pact"].some(f => f === form.alliance)) return reject(new ValidationError(400, "Alliance is not valid"));

        if (form.primary === "on") form.primary = true;
        else form.primary = false;

        if (form.champion === "on") form.champion = true;
        else form.champion = false;

        if (form.nickname === "on") form.nickname = true;
        else form.nickname = false;

        if (!form.champion)
        {
            if (form.level > 49)
            {
                form.champion = true;
                form.level = 10;
            }
        }

        if (form.champion)
        {
            if (form.level < 0 || form.level > 690) return reject(new ValidationError(400, "Level is out of bounds"));
        }

        if (form.biography.length > 500) return reject(new ValidationError(400, "Biography is too long (max. 500 characters)"));

        if (typeof form.roles === "string") form.roles = [form.roles];
        if (typeof form.professions === "string") form.professions = [form.professions];

        resolve(form);
    });
}

// New Character POST Method
let upload = multer();
router.post("/api/users/:id/characters", dClient.middleware.apiAuth, upload.single("avatar"), function(req, res)
{
    if (!req.body) return res.status(400).send("No form data was sent with the request");

    const userId = (req.params.id === "@me" ? req.session.user.id : req.params.id);
    const userDir = dClient.libs.join(__data, "users", userId);

    if (req.body._method.toUpperCase() === "POST")
    {
        dClient.libs.fs.access(userDir, function(err)
        {
            if (err && err.code === "ENOENT") return res.status(400).send("This user does not exist");
            else if (err) return res.status(500).send(err);

            dClient.libs.fs.readJson(dClient.libs.join(userDir, "characters.json"), function(err, characters)
            {
                if (err) return res.status(500).send("Cannot read characters from user");

                if (characters.length >= 12) return res.status(409).send("Characters are limited to 12 per user");

                validateFormElements(req.body)
                    .then(function(charData)
                    {
                        const character = { ownerId: req.session.user.id };
                        Object.assign(character, charData);

                        character.id = null;
                        let usedIds = characters.map(x => x.id);
                        for (let i = 0; i < characters.length + 1; i++)
                        {
                            if (!usedIds.includes(i)) character.id = i;
                        }

                        if (!characters.length && !character.primary) character.primary = true;

                        const userAvatarDir = dClient.libs.join(__webdir, ".pub_src", "esoi", "users", userId);
                        dClient.libs.fs.ensureDir(userAvatarDir, function(err)
                        {
                            if (err) return res.status(500).send("Could not establish user avatar directory");

                            if (!req.file) req.file = { buffer: dClient.libs.join(__src, "esoi", "img", "new", "default_char.png") };
                            jimp.read(req.file.buffer).then(function(image)
                            {
                                const avatarData = JSON.parse(req.body.avatarData);
                                image.crop(avatarData.x, avatarData.y, avatarData.width, avatarData.height);
                                delete character.avatarData;

                                image.write(dClient.libs.join(userAvatarDir, `${character.id}.png`), function(err)
                                {
                                    if (err) return res.status(500).send("Cannot write avatar to file");

                                    character.avatarURL = `https://i.grogsile.org/esoi/users/${userId}/${character.id}.png`;
                                    
                                    characters.push(character);

                                    dClient.libs.fs.outputJson(dClient.libs.join(userDir, "characters.json"), characters, function(err)
                                    {
                                        if (err) return res.status(500).send("Could not save character to file");

                                        dClient.eso.emit("characterAdd", character);

                                        res.redirect("/dashboard");
                                    });
                                });
                            }).catch(console.error);
                        });
                    })
                    .catch(function(error)
                    {
                        console.warn(error);
                        res.status(error.code).send(error.message);
                    });
            });
        });
    } else

    if (req.body._method.toUpperCase() === "PUT")
    {
        dClient.libs.fs.access(userDir, function(err)
        {
            if (err && err.code === "ENOENT") return res.status(400).send("This user does not exist");
            else if (err) return res.status(500).send(err);

            dClient.libs.fs.readJson(dClient.libs.join(userDir, "characters.json"), function(err, characters)
            {
                if (err) return res.status(500).send("Cannot read characters from user");

                validateFormElements(req.body).then(function(charData)
                {
                    let character = characters[charData.id];
                    let oldChar = JSON.parse(JSON.stringify(character));

                    Object.assign(character, charData);

                    if (character.primary)
                    {
                        for (let char of characters)
                        {
                            char.primary = false;
                        }
                        character.primary = true;
                    }

                    if (!req.file)
                    {
                        delete character.avatarData;

                        let characterIndex = characters.map(x => parseInt(x.id)).indexOf(parseInt(character.id));
                        characters.splice(characterIndex, 1, character);

                        dClient.libs.fs.outputJson(dClient.libs.join(userDir, "characters.json"), characters).then(function()
                        {
                            dClient.eso.emit("characterEdit", oldChar, character);

                            res.redirect("/dashboard");
                        }).catch(function(error)
                        {
                            res.status(500).send("Could not save character to file");
                        });
                    }

                    else
                    {
                        const userAvatarDir = dClient.libs.join(__webdir, ".pub_src", "esoi", "users", userId);
                        dClient.libs.fs.ensureDir(userAvatarDir, function(err)
                        {
                            if (err) return res.status(500).send("Could not establish user avatar directory");

                            jimp.read(req.file.buffer).then(function(image)
                            {
                                const avatarData = JSON.parse(charData.avatarData);
                                image.crop(avatarData.x, avatarData.y, avatarData.width, avatarData.height);
                                delete character.avatarData;

                                dClient.libs.fs.remove(dClient.libs.join(userAvatarDir, `${character.id}.png`), function(err)
                                {
                                    if (err) return res.status(500).send("Could not remove avatar");

                                    image.write(dClient.libs.join(userAvatarDir, `${character.id}.png`), function(err)
                                    {
                                        if (err) return res.status(500).send("Could not write avatar to file");

                                        character.avatarURL = `https://i.grogsile.org/esoi/users/${userId}/${character.id}.png`;

                                        characters.splice(characters.findIndex((x, i) => x.id === i), 1, character);

                                        dClient.libs.fs.outputJson(dClient.libs.join(userDir, "characters.json"), characters, function(err)
                                        {
                                            if (err) return res.status(500).send("Could not save character to file");

                                            dClient.eso.emit("characterEdit", oldChar, character);

                                            res.redirect("/dashboard");
                                        });
                                    });
                                });
                            }).catch(console.error);
                        });
                    }
                })
                .catch(function(error)
                {
                    console.error(error);
                    res.status(error.code).send(error.message);
                });
            });
        });
    } else

    if (req.body._method.toUpperCase() === "DELETE")
    {
        if (req.body.id)
        {
            dClient.libs.fs.readJson(dClient.libs.join(userDir, "characters.json")).then(function(characters)
            {
                if (characters.some(x => parseInt(x.id) === parseInt(req.body.id)))
                {
                    // delete relative avatar
                    dClient.libs.fs.remove(dClient.libs.join(__src, "esoi", "users", userId, `${req.body.id}.png`)).catch(console.warn);

                    dClient.eso.emit("characterDelete", characters.find(c => parseInt(c.id) === parseInt(req.body.id)));

                    // delete the specified character
                    characters.splice(characters.findIndex(x => parseInt(x.id) === parseInt(req.body.id)), 1);

                    dClient.libs.fs.outputJson(dClient.libs.join(userDir, "characters.json"), characters, function(err)
                    {
                        if (err) console.error(err);

                        res.redirect("/dashboard");
                    });
                } else res.status(404).send("Provided Character ID does not exist");
            }).catch(res.json);
        } else res.status(400).send("Need to provide a parameter for character 'id'");
    }
});

// ===== [ DISCORD INVITE ] ===== //

router.get("/discord", function(req, res)
{
    res.redirect(dClient.config.bot.eso.inviteURL);
});

// ===== [ ROUTER EXPORT ] ===== //

module.exports = router;
