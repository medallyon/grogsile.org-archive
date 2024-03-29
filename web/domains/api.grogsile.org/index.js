const express = require("express")
, bodyparser = require("body-parser");

// create app for "api.grogsile.org"
let app = express();
//
app.set("views", dClient.libs.join(__webdir, "views", "api"));

app.use( bodyparser.json() );
app.use( bodyparser.urlencoded({ extended: true }) );
app.use(require(dClient.libs.join(__webdir, "routers", "api.grogsile.js", "api.grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
