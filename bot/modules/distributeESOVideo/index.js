const fs = require("fs-extra")
, join = require("path").join
, Discord = require("discord.js");

function distributeESOVideo(video)
{
    console.log(video.items[0]);
    let videoEmbed = new Discord.RichEmbed()
        .setColor(parseInt("B31217", 16))
        .setAuthor(video.snippet.channelTitle, video.items[0].snippet.thumbnails.high.url || "", `https://youtube.com/channel/${video.snippet.channelId}`)
        .setTitle(video.snippet.title)
        .setURL(`https://youtu.be/${video.id}`)
        .setDescription(video.snippet.description)
        .setImage(video.snippet.thumbnails.maxres.url)
        .setFooter(`Provided to you by Grogsile Inc. | ${utils.fancyESODate(new Date(video.snippet.publishedAt))}`, dClient.config.eso.youtube.footer.icon || dClient.user.avatarURL);

    if (videoEmbed.description.length > 300) videoEmbed.setDescription(video.snippet.description.slice(0, 300) + "...");
    if (videoEmbed.description.split("\n").length >= 3) videoEmbed.setDescription(videoEmbed.description.split("\n")[0] + "\n" + videoEmbed.description.split("\n")[1] + "\n" + videoEmbed.description.split("\n")[2]);

    fs.readJson(join(__data, "subscriptions.json"), (err, subscriptions) => {
        if (err) console.error(err);

        for (let channel of subscriptions.youtube)
        {
            dClient.channels.get(channel).sendEmbed(videoEmbed).catch(console.error);
        }
    });
}

module.exports = distributeESOVideo;
