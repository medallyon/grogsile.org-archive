const express = require("express")
, session = require("express-session")
, Grant = require("grant-express")
, Discord = require("discord.js");
let grant = new Grant(require(dClient.libs.join(__webdir, "config.json")));
const FileStore = require("session-file-store")(session);

let router = express.Router()
, locals = {};

// ===== [ DISCORD AUTH ] ===== //

let now = new Date();
router.use(session({
    secret: dClient.config.web.session.secret,
    // generate secret based on the week of the month
    secret: parseInt(Math.pow(now.getUTCFullYear() + now.getUTCMonth() + Math.floor(now.getUTCDate() / dClient.modules.utils.daysInMonth(now) * 4), 4).toString(8)).toString(16),
    resave: false,
    saveUninitialized: false,
    cookie: { path: "/", httpOnly: false, secure: false, maxAge: 1000 * 60 * 60 * 24 * (dClient.modules.utils.daysInMonth(now) / 4) },
    store: new FileStore({ path: dClient.libs.join(__data, "sessions") })
}));
router.use(grant);

router.get("/login", dClient.middleware.isLoggedIn, function(req, res)
{
    res.redirect("/");
});

router.get("/actuallylogin", function(req, res)
{
    res.redirect("https://discordapp.com/api/oauth2/authorize?client_id=231606856663957505&redirect_uri=https%3A%2F%2Fbot.grogsile.org%2Fcallback&response_type=code&scope=identify%20guilds");
});

router.get("/callback", dClient.middleware.completeSignIn, function(req, res)
{
    if (!req.session.user)
    {
        console.error("Session User does not exist");
        return res.redirect("/");
    }

    let userDir = dClient.libs.join(__data, "users", req.session.user.id);
    dClient.libs.fs.ensureDir(userDir).then(function()
    {
        dClient.libs.fs.readdir(userDir, function(err, files)
        {
            if (err) console.error(err);

            dClient.libs.fs.outputJson(dClient.libs.join(userDir, "user.json"), req.session.user).then(function()
            {
                if (files.indexOf("account.json") === -1)
                {
                    let userAccount = JSON.parse(JSON.stringify(dClient.config.templates.account));
                    userAccount.id = req.session.user.id;

                    dClient.libs.fs.outputJson(dClient.libs.join(userDir, "account.json"), userAccount).then(function()
                    {
                        res.redirect("/guilds");
                    }).catch(console.error);
                } else res.redirect("/guilds");
            }).catch(console.error);
        });
    }).catch(console.error);
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

    let webApp = dClient.webApps["bot.grogsile.org"];
    res.render = function(view, _locals)
    {
        webApp.render(view, { _locals }, function(err, htmlString)
        {
            if (err) throw err;
            else res.send(htmlString);
        });
    };

    locals = {
        document: {
            title: null,
            location: req.originalUrl
        },
        user: req.user || null,
        account: {}
    };

    if (locals.user)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__data, "users", req.user.id, "account.json")).then(function(account)
        {
            locals.account = account;

            if (locals.user.guilds)
            {
                locals.user.guilds = locals.user.guilds.filter(function(g)
                {
                    let permissions = new Discord.Permissions(g.permissions);
                    return (permissions.has("MANAGE_GUILD", true) || g.owner.id === locals.user.id);
                });

                locals.user.guilds = locals.user.guilds.map(function(g)
                {
                    let guild = dClient.guilds.get(g.id);
                    if (!guild) return Object.assign(g, { joined: false });

                    return Object.assign(g, {
                        joined: true,
                        available: guild.available,
                        config: guild.config.raw,
                        members: guild.members.size,
                        channels: guild.channels.map(function(c)
                        {
                            return {
                                id: c.id,
                                name: c.name,
                                type: c.type,
                                position: c.rawPosition,
                                children: (c.type === "category") ? c.children.map(function(x)
                                {
                                    return {
                                        id: x.id,
                                        name: x.name,
                                        type: x.type,
                                        position: x.rawPosition
                                    };
                                }) : null
                            };
                        }),
                        roles: guild.roles.map(function(r)
                        {
                            return {
                                id: r.id,
                                name: r.name,
                                color: r.color,
                                position: r.rawPosition
                            };
                        })
                    });
                });
            }

            next();
        }).catch(console.error);
    } else next();
}

// ===== [ HOME ] ===== //

router.get("/", resetLocals, function(req, res)
{
    if (!req.user) res.render("pages/home", locals);
    else res.redirect("/guilds");
});

// ===== [ GUILDS OVERVIEW ] ===== //

router.get("/dashboard", function(req, res)
{
    res.redirect("/guilds");
});

router.get("/guilds", dClient.middleware.isLoggedIn, resetLocals, function(req, res)
{
    res.render("pages/guilds", locals);
});

// ===== [ GUILD CONFIGURATION ] ===== //

router.get("/guilds/:id", dClient.middleware.isLoggedIn, resetLocals, function(req, res)
{
    if (!dClient.guilds.has(req.params.id) || !req.user.guilds.some(g => g.id === req.params.id)) return res.render("pages/error", Object.assign(locals, { error: { statusCode: 404, title: "Guild not found", message: `Try <a href="${dClient.constants.discord.inviteURL}">re-inviting</a> <b>The Tamriel Messenger</b> to your server.` } }));

    locals.currentGuild = locals.user.guilds.find(g => g.id === req.params.id);
    res.render("pages/guild", locals);
});

function successfulConfigRequest(req, res)
{
    locals.currentGuild = locals.user.guilds.find(g => g.id === req.params.id);
    res.render("pages/guild", Object.assign(locals, { alert: { type: "success", message: "Your Server Config has been updated!" } }));
}
router.post("/guilds/:id/welcomeMessage", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "welcomeMessage.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/esoNews", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "esoNews.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/esoPatchNotes", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "esoPatchNotes.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/esoYouTube", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "esoYouTube.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/liveServerStatus", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "liveServerStatus.js")), resetLocals, successfulConfigRequest);
// router.post("/guilds/:id/rss", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "rss.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/restrictChannels", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "restrictChannels.js")), resetLocals, successfulConfigRequest);
router.post("/guilds/:id/commands", dClient.middleware.isLoggedIn, resetLocals, require(dClient.libs.join(__dirname, "configHandlers", "commands.js")), resetLocals, successfulConfigRequest);

// ===== [ STATIC REDIRECTS ] ===== //

router.get("/invite", function(req, res)
{
    res.redirect(dClient.constants.discord.bot.inviteURL);
});

router.get("/discord", function(req, res)
{
    res.redirect(dClient.constants.discord.devServer.inviteURL);
});

// ===== [ ABOUT ] ===== //

router.get(/^\/about(?:\/embed)?/, resetLocals, function(req, res)
{
    res.render("pages/about", locals);
});

// ===== [ ROUTER EXPORT ] ===== //

module.exports = router;
