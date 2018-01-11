const express = require("express")
, bodyparser = require("body-parser");

// create app for "bot.grogsile.org"
app = express();
// 
app.set("views", join(__webdir, "views", "bot"));
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use( bodyparser.json({ limit: "10mb" }) );
app.use( bodyparser.urlencoded({ limit: "10mb", extended: true }) );
app.use(require(join(__webdir, "routers", "bot.grogsile.js", "bot.grogsile.js")));
/////////////////////////////////////////////////////////////

global.botApplication = app;

module.exports = app;
