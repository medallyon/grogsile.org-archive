const express = require("express")
, bodyparser = require("body-parser");

// create app for "esoi.grogsile.org"
let app = express();
//
app.set("views", dClient.libs.join(__webdir, "views", "esoi"));
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use( bodyparser.json({ limit: "10mb" }) );
app.use( bodyparser.urlencoded({ limit: "10mb", extended: true }) );
app.use(require(dClient.libs.join(__webdir, "routers", "esoi.grogsile.js", "esoi.grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
