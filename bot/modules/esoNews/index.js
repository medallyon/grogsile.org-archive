const exec = require("child_process").exec
, request = require("request")
, FeedParser = require("feedparser");

// config
const config = require(join(__dirname, "config.json"));
let latest = fs.readJsonSync(join(__dirname, "savedVars.json"))
, imgIsDifferent = false
, spamCount = 0;

setTimeout(function()
{
    fetchNewestImage();
    spamCompare();
}, 60000);
setInterval(function()
{
    fetchNewestImage();
    spamCompare();
}, config.interval * 60 * 1000);

// checks the newest image on /en-us/news
function fetchNewestImage()
{
    exec(`phantomjs ${join(__dirname, "fetchLatestPost.js")}`, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });
}

// checks for any changes on feed url
function checkUpdate(url)
{
    return new Promise(function(resolve, reject)
    {
        let first = true;
        request(url)
            .pipe(new FeedParser())
            .on("error", function(error) {
                reject(error);
            })
            .on("readable", function() {
                let stream = this, item;
                while (item = stream.read()) {
                    if (first) {
                        first = false;
                        const tempItem = item;

                        fs.readJson(join(__dirname, "savedVars.json"), (err, savedVars) => {
                            if (err) reject(err);

                            latest.title = tempItem.title
                            , latest.pubDate = Date.parse(tempItem.pubDate)
                            , latest.description = tempItem.description
                            , latest.summary = tempItem.description
                            , latest.link = tempItem.link;

                            resolve();
                        });
                    }
                }
            });
        });
}

// spam-compare content of image.txt with latest.image
// this is needed because there is no definite callback for the previous process
function spamCompare()
{
    setTimeout(function()
    {
        fs.readFile(join(__dirname, "image.txt"), "utf8", (err, image) => {
            if (err) console.error(err);

            spamCount++;
            imgIsDifferent = (image !== latest.image);
            if (imgIsDifferent)
            {
                latest.image = image;
                checkUpdate(config.feed).then(() => {
                    postNews(Object.assign({ key: config.apikey }, latest));
                }).catch(console.error);
                spamCount = 0;
            } else {
                if (spamCount !== 12) return spamCompare();
                spamCount = 0;
            }
        });
    }, 2000);
}

// posts news to ESOI API endpoint
function postNews(item)
{
    fs.outputJson(join(__dirname, "savedVars.json"), latest, (err) => { if (err) console.error(err) });
    request({
        url: "https://api.grogsile.me/eso/news",
        method: "post",
        json: item
    });
    imgIsDifferent = false;
}
