const fs = require("fs-extra")
, join = require("path").join
, Discord = require("discord.js");

function distributeESONews(item)
{
    let newsEmbed = new Discord.RichEmbed()
        .setColor(utils.randColor())
        .setAuthor(dClient.config.eso.news.author.name, dClient.config.eso.news.author.avatar, dClient.config.eso.news.author.url)
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.description)
        .setImage(item.image || dClient.config.eso.news.defaultImage || "")
        .setFooter(`Provided to you by Grogsile Inc. | ${utils.fancyESODate(new Date(item.pubDate))}`, dClient.config.eso.news.footer.avatar || dClient.user.avatarURL);

    fs.readJson(join(__data, "subscriptions.json"), (err, subscriptions) => {
        if (err) console.error(err);

        for (let channel of subscriptions.eso)
        {
            dClient.channels.get(channel).sendEmbed(newsEmbed).catch(console.error);
        }
    });
}

module.exports = distributeESONews;
