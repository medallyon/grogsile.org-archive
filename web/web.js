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

app.use(cookieParser());

app.use( bodyparser.json({ limit: "10mb" }) );
app.use( bodyparser.urlencoded({ limit: "10mb", extended: true }) );

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

for (let subdomain of fs.readdirSync(join(__dirname, "domains")))
{
    app.use(vhost(subdomain, require(join(__dirname, "domains", subdomain, "index.js"))));
}

// === [ LISTENER ] === //

// listen on port 8080, with reverse routing of nginx to port 80
global.server = http.createServer(app);
server.listen(8080);
