function distributeESONews(item)
{
    let newsEmbed = new Discord.RichEmbed(constants.discord.embed)
        .setAuthor(dClient.config.eso.news.author.name, dClient.config.eso.news.author.avatar, dClient.config.eso.news.author.url)
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.description)
        .setImage(item.image || dClient.config.eso.news.defaultImage || "")
        .setFooter(`Provided to you by Grogsile Inc. | ${utils.fancyESODate(new Date(item.pubDate))}`, dClient.config.eso.news.footer.avatar || dClient.user.avatarURL);

    fs.readdir(join(__data, "guilds"), (err, guilds) => {
        if (err) console.error(err);

        for (let g of guilds)
        {
            fs.readJson(join(__data, "guilds", g, "config.json"), (err, config) => {
                if (err) console.error(err);

                if (config.eso.news.active)
                {
                    dClient.channels.get(config.eso.news.channel).send({ embed: newsEmbed }).catch(console.error);
                }
            });
        }
    });
}

module.exports = distributeESONews;
