phantom.casperPath = "/home/medallyon/node-projects/rss-eso-news/node_modules/casperjs";
phantom.injectJs(phantom.casperPath + "/bin/bootstrap.js");

var image = "";

var casper = require("casper").create();
var fs = require("fs");

casper.start("http://elderscrollsonline.com/en-us/agegate")

.waitForSelector("#year", function() {
    this.echo("Loaded agegate..");
    this.fillSelectors('form', {"input#year": "1998", "input#month": "11", "input#day": "21"}, true);
})

.thenOpen("http://www.elderscrollsonline.com/en-us/news")
.waitForSelector(".slot", function() {
    this.echo("Accessed /en-us/news..");
    image = this.getElementAttribute("div.news-list > div.row > article > a.slot > img", "src");
    this.echo("Newest image is " + image);
    fs.write("image.txt", image, "w");
    this.echo("Wrote image path to file");
}, function() {}, 20000);

casper.run(function() {
    this.exit();
});
