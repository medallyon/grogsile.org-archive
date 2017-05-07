const express = require("express")
, bodyparser = require("body-parser")
, join = require("path").join;

// create app for "esoi.grogsile.me"
app = express();
// 
app.set("views", join(__webdir, "views", "esoi"));

app.use( bodyparser.json({ limit: "10mb" }) );
app.use( bodyparser.urlencoded({ limit: "10mb", extended: true }) );
app.use(require(join(__webdir, "routers", "esoi.grogsile.js", "esoi.grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
