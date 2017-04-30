const fs = require("fs-extra")
, path = require("path")
, request = require("request")
, express = require("express");

let router = express.Router();

// ===== [ YOUTUBE ] ===== //

// returns the newest video snippet of any YouTube channel
router.get("/youtube/newestVideo", (req, res) => {
    if (!req.query.hasOwnProperty("channel")) return res.status(400).end();

    let channelId = req.query.channel;
    request(`https://www.googleapis.com/youtube/v3/channels?key=${dClient.config.api.keys.google}&id=${channelId}&part=contentDetails`, (err, channelRes, contentDetails) => {
        if (err) console.error(err);

        let uploadsId = JSON.parse(contentDetails).items[0].contentDetails.relatedPlaylists.uploads;
        request(`https://www.googleapis.com/youtube/v3/playlistItems?key=${dClient.config.api.keys.google}&playlistId=${uploadsId}&part=snippet`, (err2, playlistRes, playlist) => {
            if (err2) console.error(err2);

            res.json(JSON.parse(playlist).items[0].snippet);
        });
    });
});

// ===== [ ELDER SCROLLS ONLINE ] ===== //

// processes updates over at elderscrollsonline.com/news
router.post("/eso/news", (req, res) => {
    console.log("got a new request: " + JSON.stringify(req.body, null, 2));
    if (!req.body) return res.status(400).end();

    fs.readJson(path.join(__dirname, "content", "eso", "news", "savedVars.json"), (err, savedVars) => {
        if (err) console.error(err);

        if (req.body.pubDate > savedVars.pubDate) {
            savedVars = req.body;
            fs.writeJson(path.join(__dirname, "content", "eso", "news", "savedVars.json"), savedVars, (err) => {
                if (err) console.error(err);
            });

            let item = req.body;
            modules.distributeESONews(item);

            res.status(200).json(item);
        } else {
            res.json(req.body);
        }
    });
});

// Zapier.com - posts whenever a new video by Bethesda has been detected
router.post("/eso/youtube/newest", (req, res) => {
    if (dClient.config.api.youtube.allowedChannels.some(x => x === req.body.author_id)) {
        let video = req.body;

        // request to get channel's HD icon
        request(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${req.body.author_id}&fields=items%2Fsnippet%2Fthumbnails&key=${dClient.config.api.keys.google}`, (err, ytRes, ytBody) => {
            if (err) console.error(err);

            video = JSON.parse(ytBody);

            // request to get video's info
            request(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${req.body.id}&fields=items&key=${dClient.config.api.keys.google}`, (err, ytRes, ytBody) => {

                Object.assign(video, JSON.parse(ytBody).items[0]);

                if (!video.snippet.title.toLowerCase().includes("the elder scrolls online") || !video.snippet.title.toLowerCase().includes("eso")) {
                    req.body.code = 409;
                    req.body.status = "Video is not ESO-related";
                    return res.json(req.body);
                }

                modules.distributeESOVideo(video);
                res.status(200).json(video);
            });
        });
    } else {
        req.body.code = 401;
        req.body.error = "YouTube Channel not authorised";
        res.json(req.body);
    }
});

module.exports = router;
