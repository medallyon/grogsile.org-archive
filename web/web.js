// === [ LIBRARIES ] === //

const fs = require("fs-extra")
, path = require("path")
, join = path.join

, Discord = require("discord.js")

, http = require("http")
, express = require("express")
, vhost = require("vhost")
, favicon = require("serve-favicon")
, cookieParser = require("cookie-parser");

// === [ APPS ] === //

// initialise main server
var app = express();

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// === [ VHOSTS ] === //

for (let subdomain of fs.readdirSync(join(__dirname, "domains"))) {
    app.use(vhost(subdomain, require(join(__dirname, "domains", subdomain, "index.js"))));
}

// === [ LISTENER ] === //

// listen on port 8080, with reverse routing of nginx to port 80
var server = http.createServer(app);
server.listen(8080);
