const express = require("express")
, join = require("path").join;

// create app for "i.grogsile.org"
app = express();
// 
app.use(express.static(join(__src)));
/////////////////////////////////////////////////////////////

module.exports = app;
