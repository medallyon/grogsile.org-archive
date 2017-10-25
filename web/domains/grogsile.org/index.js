const express = require("express")
, join = require("path").join;

// create app for "grogsile.me"
app = express();
//
app.set("views", join(__webdir, "views", "main"));
app.use(require(join(__webdir, "routers", "grogsile.js", "grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
