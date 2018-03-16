const request = require("request")
, express = require("express")
, multer = require("multer")
, Discord = require("discord.js");

let router = express.Router();

// ===== [ ESO PLEDGE ROTATION ] ===== //

const rotations = require(dClient.libs.join(__dirname, "content", "eso", "rotations.json"));

router.get("/eso/pledges", function(req, res)
{
    let daysPassed = Math.floor((Date.now() - Date.parse(rotations.start.date)) / 1000 / 60 / 60 / 24) * -1
    , pledgeIndexes = {
        "Maj al-Ragath": rotations["Maj al-Ragath"].indexOf(rotations.start["Maj al-Ragath"]),
        "Glirion the Redbeard": rotations["Glirion the Redbeard"].indexOf(rotations.start["Glirion the Redbeard"]),
        "Urgarlag Chief-bane": rotations["Urgarlag Chief-bane"].indexOf(rotations.start["Urgarlag Chief-bane"])
    }
    , pledges = {
        "Maj al-Ragath": rotations.start["Maj al-Ragath"],
        "Glirion the Redbeard": rotations.start["Glirion the Redbeard"],
        "Urgarlag Chief-bane": rotations.start["Urgarlag Chief-bane"]
    };

    for (let questGiver in pledgeIndexes)
    {
        let questIndex = pledgeIndexes[questGiver];

        for (let i = 0; i < daysPassed; i++)
        {
            if (++questIndex === rotations[questGiver].length)
                questIndex = 0;
        }

        pledges[questGiver] = [
            rotations[questGiver][questIndex],
            rotations[questGiver][(++questIndex < rotations[questGiver].length) ? questIndex : 0]
        ];
    }

    res.json(pledges);
});

{
    {
        {
        });
    });

{
    if (!req.body) return res.status(400).json({ status: 400, error: "No body attached" });


    {

        {
        }

    });
}

{

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
