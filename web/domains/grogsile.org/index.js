const express = require("express");

// create app for "grogsile.me"
let app = express();
//
app.set("views", dClient.libs.join(__webdir, "views", "main"));
app.use(require(dClient.libs.join(__webdir, "routers", "grogsile.js", "grogsile.js")));
/////////////////////////////////////////////////////////////

module.exports = app;
