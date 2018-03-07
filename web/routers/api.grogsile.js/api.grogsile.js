const request = require("request")
, express = require("express")
, multer = require("multer")
, parseXML = require("xml2js").parseString;
, Discord = require("discord.js")
, crypto = require("crypto");

let router = express.Router();

// ===== [ TRAVIS CI ] ===== //

const TRAVIS_CONFIG_URL = "https://api.travis-ci.org/config"
, TRAVIS_HOOK_ICON_URL = "https://koenig-media.raywenderlich.com/uploads/2015/07/Featured4-320x320.png";

let travisHook = new Discord.WebhookClient(dClient.config.web.discord.webhooks.travis.id, dClient.config.web.discord.webhooks.travis.token);
travisHook.edit({ name: "Travis CI", avatar: TRAVIS_HOOK_ICON_URL }).catch(console.error);

const GITHUB_API_ROOT = "https://api.github.com"
, GITHUB_API_USERS_ENDPOINT = "/users/";
function fetchGithubUser(username)
{
    return new Promise(function(resolve, reject)
    {
        request(GITHUB_API_ROOT + GITHUB_API_USERS_ENDPOINT + username, function(err, res, body)
        {
            if (err) return reject(new Error("An error occurred while requesting GitHub User Info"));
            else resolve(body);
        });
    });
}

// https://github.com/Brodan/travis-webhook-verification-nodejs/blob/master/express.js
function verifySignature(req, res, next)
{
    if (!req.body) return res.status(400).json({ status: 400, error: "No body attached" });
    if (!req.headers.signature) return res.status(400).json({ status: 400, error: "No signature found" });

    const signature = Buffer.from(req.headers.signature, "base64")
    , payload = req.body.payload;
    let status = false;

    request(TRAVIS_CONFIG_URL, function(err, response, config)
    {
        if (err) return res.status(500).json({ status: 500, error: "Something went wrong while requesting Travis Config" });

        const pubKey = JSON.parse(response.body).config.notifications.webhook.public_key;
        
        let verifier = crypto.createVerify("sha1");
        verifier.update(payload);
        status = verifier.verify(signature, pubKey);

        if (status) next();
        else return res.status(401).json({ status: 401, error: "Invalid Signature" });
    });
}

router.post("/travis-ci/webhooks", verifySignature, async (req, res) =>
{
    const payload = req.body.payload
    , githubUser = await fetchGithubUser(payload.committer_name);

    let embed = new Discord.MessageEmbed()
        .setAuthor("Travis CI - Build Overview", githubUser.avatar_url || TRAVIS_HOOK_ICON_URL, payload.build_url)
        .addField("Commit Message", payload.message)
        .addField("Status", payload.status_message, true)
        .addField("Duration", dClient.modules.utils.timeSince(Date.now() - payload.duration * 1000), true)
        .addField("Commit", `[View this commit](${payload.compare_url})`, true)
        .addField("Finished at", new Date(payload._finished_at))
        .setTimestamp(Date.parse(payload.commited_at))
        .setFooter(dClient.constants.discord.embed.footer.text, dClient.constants.discord.embed.footer.icon_url);

    if (payload.status === 0)
        embed.setColor([92, 184, 92])
            .setDescription("✅ Build Passed!");
    else
        embed.setColor([217, 83, 79])
            .setDescription("❌ Build Failed!");

    travisHook.send({ embed }).catch(console.error);
});

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
