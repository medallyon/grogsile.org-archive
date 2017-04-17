const express = require("express")
, bodyparser = require("body-parser")
, join = require("path").join;

// create app for "api.grogsile.me"
app = express();
// 
app.set("views", join(__webdir, "views", "api"));

app.use( bodyparser.json() );
app.use( bodyparser.urlencoded({ extended: true }) );
app.use(require(join(__webdir, "middleware", "apiAuth", "apiAuth.js")));
app.use(require(join(__webdir, "routers", "api.grogsile.js", "api.grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
