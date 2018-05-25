const request = require("request")
, toMarkdown = require("to-markdown")
, Discord = require("discord.js");

const YT_BETHESDA = "UCvZHe-SP3xC7DdOk4Ri8QBw"
, ICON_YT = "https://yt3.ggpht.com/-eof0rtpeNVE/AAAAAAAAAAI/AAAAAAAAAAA/rxqiMwVYJU8/s288-c-k-no-mo-rj-c0xffffff/photo.jpg";

function fetchNewestVideo()
{
    return new Promise(function(resolve, reject)
    {
        request(`https://www.googleapis.com/youtube/v3/channels?key=${dClient.config.bot.api.keys.google}&id=${YT_BETHESDA}&part=contentDetails`, function(err, channelRes, contentDetails)
        {
            if (err)
                return reject(err);

            let uploadsId = JSON.parse(contentDetails).items[0].contentDetails.relatedPlaylists.uploads;
            request(`https://www.googleapis.com/youtube/v3/playlistItems?key=${dClient.config.bot.api.keys.google}&playlistId=${uploadsId}&part=snippet`, function(err2, playlistRes, playlist)
            {
                if (err2)
                    return reject(err2);

                resolve(JSON.parse(playlist).items[0].snippet);
            });
        });
    });
}

function videoIsESO(video, previousVideo)
{
    if (!(Date.parse(video.publishedAt) > Date.parse(previousVideo.publishedAt)))
        return false;

    if ((video.title).toLowerCase().split(" ").some(x => x === "eso") || video.title.toLowerCase().includes("elder scrolls online"))
        return true;

    return false;
}

function treatDescription(text)
{
    const originalText = text;
    let textArray = text.split(" ");
    if (textArray.length > 150)
        text = textArray.slice(0, 150).join(" ");

    if (text.includes("\n \n"))
        text = text.slice(0, text.indexOf("\n \n"));
    if (text.includes("\n\n"))
        text = text.slice(0, text.indexOf("\n\n"));

    if (originalText.length !== text.length)
        text += "...";

    return toMarkdown(text);
}

function constructEmbed(video)
{
    let imageObj = video.thumbnails.maxres || video.thumbnails.standard || video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default;

    let e = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setColor([204, 24, 30])
        .setAuthor(video.channelTitle, ICON_YT, `https://youtube.com/channel/${video.channelId}`)
        .setTitle(video.title)
        .setURL(`https://youtube.com/watch?v=${video.resourceId.videoId}`)
        .setDescription(treatDescription(video.description))
        .setImage(imageObj.url);

    return e;
}

function distributeEmbed(embed)
{
    for (const guild of dClient.guilds.values())
    {
        if (guild.config.eso.youtube.enabled)
        {
            let channel = dClient.channels.get(guild.config.eso.youtube.channel);
            if (!channel)
                continue;

            dClient.modules.utils.toggleRoles(guild.config.eso.youtube.toggleRoles, guild.config.eso.youtube.roles.map(x => guild.roles.get(x))).then(function(roles)
            {
                channel.send(roles.map(r => r.toString()).join(" "), { embed }).then(function()
                {
                    dClient.modules.utils.toggleRoles(guild.config.eso.youtube.toggleRoles, guild.config.eso.youtube.roles.map(x => guild.roles.get(x))).catch(dClient.modules.utils.consoleError);
                }).catch(dClient.modules.utils.consoleError);
            }).catch(dClient.modules.utils.consoleError);
        }
    }
}

function esoYouTube()
{
    fetchNewestVideo().then(function(newestVideo)
    {
        dClient.libs.fs.readJson(dClient.libs.join(__dirname, "savedVars.json")).then(function(previousVideo)
        {
            if (videoIsESO(newestVideo, previousVideo))
            {
                distributeEmbed(constructEmbed(newestVideo));
                dClient.libs.fs.outputJson(dClient.libs.join(__dirname, "savedVars.json"), newestVideo).catch(dClient.modules.utils.consoleError);
            }
        }).catch(dClient.modules.utils.consoleError);
    }).catch(dClient.modules.utils.consoleError);
}

module.exports = function()
{
    esoYouTube();
};

module.exports.name = "esoYouTube";
module.exports.about = "Fetches the latest video by Bethesda on YouTube.";
module.exports.alias = [];
module.exports.arguments = {};
module.exports.userPermissions = 10000;
module.exports.example = "";
module.exports.function = esoYouTube;
