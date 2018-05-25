const Discord = require("discord.js");

const baseImgURL = "http://esolog.uesp.net/itemLinkImage.php?version=17pts&level=66&quality=5&itemid="
, baseSummaryURL = "http://esolog.uesp.net/itemLink.php?version=17pts&summary&itemid=";

function deduceItemSummary(item)
{
    return Object.assign({
        url: baseImgURL + item.id
    }, item);
}

function findItems(itemCollection, item)
{
    // check if requested item is itemID
    if (itemCollection.has(item))
        return [ itemCollection.get(item) ];

    // otherwise, return all items containing requested item's words
    return itemCollection.filter(x => x.name.toLowerCase().includes(item.toLowerCase())).array();
}

function searchUESPItems(item)
{
    let items = findItems(dClient.eso.items, item).map(i => deduceItemSummary(i));
    let numberOfItems = items.length;

    let randomItems = [];
    if (items.length > 10)
    {
        for (let i = 0; i < 10; i++)
            randomItems.push(items.splice(Math.floor(Math.random() * items.length), 1)[0]);
        return [ randomItems, numberOfItems ];
    }

    else
        return [ items, numberOfItems ];
}

function esoItem(msg, itemName = null)
{
    if (msg.command && !msg.guild.config.guild.commands.esoItem.usage.command)
        return;

    if (msg.command)
        itemName = msg.args.join(" ");

    if (!itemName || !itemName.length)
        return;

    try
    {
        let applicableItems, numberOfOtherItems;
        [ applicableItems, numberOfOtherItems ] = searchUESPItems(itemName);

        if (!applicableItems.length)
            msg.channel.send(`${msg.author.toString()} There are no items with the name \`${itemName}\`, it seems.`).catch(dClient.modules.utils.consoleError);
        else if (applicableItems.length === 1)
            msg.channel.send({ files: [{ "name": `${applicableItems[0].name}.png`, "attachment": applicableItems[0].url }] }).catch(dClient.modules.utils.consoleError);
        else
        {
            // collect user input for first random 10 items
            let embedItems = applicableItems.map(item => ({ name: item.name, value: (item.description.length) ? item.description : "No description." }));
            let collectorEmbed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                .setDescription(`There are a total of **${numberOfOtherItems}** items that match \`${itemName}\``);
            collectorEmbed.fieldValueLength = 50;

            dClient.modules.utils.createSelectorEmbed(msg, embedItems, collectorEmbed).then(function([ itemNumber, collectorMessage ])
            {
                let selectedItem = applicableItems[itemNumber - 1];

                let itemEmbed = new Discord.MessageEmbed(dClient.constants.discord.embed)
                    .setAuthor(selectedItem.name, "", baseSummaryURL + selectedItem.id)
                    .setDescription(selectedItem.description)
                    .setImage(selectedItem.url);

                collectorMessage.edit({ embed: itemEmbed }).catch(dClient.modules.utils.consoleError);
            }).catch(dClient.modules.utils.consoleError);
        }
    }

    catch (err)
    {
        dClient.modules.utils.consoleError({ name: err.name, message: ":x: Something went wrong while looking for this item. If this keeps happening, talk to a developer over at <https://bot.grogsile.org/discord>." }, null, msg.channel);
    }
}

module.exports = function(msg, itemName = null)
{
    esoItem(msg, itemName);
};

module.exports.name = "esoItem";
module.exports.about = "Searches for a given item from Elder Scrolls Online.";
module.exports.alias = [
    "esoitem",
    "item"
];
module.exports.arguments = {
    input: {
        description: "The item to search for.",
        optional: false
    }
};
module.exports.userPermissions = 100;
module.exports.example = "Valkyn Skoria's Hat";
module.exports.function = esoItem;
