const request = require("request")
, express = require("express")
, multer = require("multer")
, parseXML = require("xml2js").parseString;

let router = express.Router();

// ===== [ YOUTUBE ] ===== //

// returns the newest video snippet of any YouTube channel
router.get("/youtube/newest", middleware.apiAuth, (req, res) => {
    if (!req.query.hasOwnProperty("channel")) return res.status(400).end();

    let channelId = req.query.channel;
    request(`https://www.googleapis.com/youtube/v3/channels?key=${dClient.config.api.keys.google}&id=${channelId}&part=contentDetails`, function(err, channelRes, contentDetails)
    {
        if (err) return console.error(err);

        let uploadsId = JSON.parse(contentDetails).items[0].contentDetails.relatedPlaylists.uploads;
        request(`https://www.googleapis.com/youtube/v3/playlistItems?key=${dClient.config.api.keys.google}&playlistId=${uploadsId}&part=snippet`, function(err2, playlistRes, playlist)
        {
            if (err2) return console.error(err2);

            res.json(JSON.parse(playlist).items[0].snippet);
        });
    });
});

module.exports = router;
