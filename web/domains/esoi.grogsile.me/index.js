const express = require("express")
, bodyparser = require("body-parser")
, join = require("path").join;

function domain()
{
    // create app for "esoi.grogsile.me"
    app = express();
    // 
    app.set("views", join(__webdir, "views", "esoi"));

    app.use( bodyparser.json() );
    app.use( bodyparser.urlencoded({ extended: true }) );
    app.use(require(join(__webdir, "routers", "esoi.grogsile.js", "esoi.grogsile.js")));
    /////////////////////////////////////////////////////////////

    return app;
}

module.exports = domain;
