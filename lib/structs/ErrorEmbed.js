const Discord = require("discord.js");

class ErrorEmbed extends Discord.MessageEmbed
{
    constructor(error = null, description = null, details = null)
    {
        super();

        this.setColor("#AA1919");
        this.setThumbnail("http://icons.iconarchive.com/icons/kyo-tux/phuzion/256/Sign-Error-icon.png");
        this.setTimestamp(new Date());
        this.setFooter("", dClient.constants.discord.embed.footer.icon_url);

        if (error instanceof Error)
        {
            this.setAuthor(error.name);
            if (description)
                this.setDescription(description);
            else
                this.setDescription(error.message);

            if (details)
                this.addField("Details", details);
        }

        else
        {
            if (error && (typeof error) === "string")
                this.setAuthor(error);
            else
                this.setAuthor("Error");

            if (description)
                this.setDescription(description);
            else
                this.setDescription("Something went wrong.");

            if (details)
                this.addField("Details", details);
        }
    }
};

module.exports = ErrorEmbed;
