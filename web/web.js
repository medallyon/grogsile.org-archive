// === [ LIBRARIES ] === //

const http = require("http")
, express = require("express")
, vhost = require("vhost")
, favicon = require("serve-favicon")
, bodyparser = require("body-parser")
, cookieParser = require("cookie-parser");

// === [ APPS ] === //

// initialise main server
var app = express();

app.set("view engine", "ejs");
app.set("views", join(__webdir, "views"));

app.use(cookieParser());

let attachRawBody = function(req, res, buf, encoding)
{
    if (buf && buf.length) req.rawBody = buf.toString(encoding || 'utf8');
}
app.use( bodyparser.json({ limit: "10mb", verify: attachRawBody }) );
app.use( bodyparser.urlencoded({ limit: "10mb", extended: true, verify: attachRawBody }) );
app.use( bodyparser.raw({ limit: "10mb", verify: attachRawBody }) );

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// === [ MIDDLEWARE ] === //

global.middleware = {};
for (let script of fs.readdirSync(join(__dirname, "middleware")))
{
    middleware[script] = require(join(__dirname, "middleware", script, `${script}.js`));
}

// === [ VHOSTS ] === //

global.webApps = {};
for (let subdomain of fs.readdirSync(join(__dirname, "domains")))
{
    let webApp = require(join(__dirname, "domains", subdomain, "index.js"));
    app.use(vhost(subdomain, webApp));
    webApps[subdomain] = webApp;
}

// === [ LISTENER ] === //

// listen on port 8080, with reverse routing of nginx to port 80
global.server = http.createServer(app);
server.listen(8080);
