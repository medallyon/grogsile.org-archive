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
    if (itemCollection.has(item)) return [itemCollection.get(item)];

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
        for (let i = 0; i < 10; i++) randomItems.push(items.splice(Math.floor(Math.random() * items.length), 1)[0]);
        return [ randomItems, numberOfItems ];
    } else return [ items, numberOfItems ];
}

function esoItem(msg, itemName = null)
{
    if (msg.command && !msg.guild.config.guild.commands.esoItem.usage.command) return;

    if (msg.command) itemName = msg.args.join(" ");
    if (!itemName || !itemName.length) return;

    try
    {
        let applicableItems, numberOfOtherItems;
        [ applicableItems, numberOfOtherItems ] = searchUESPItems(itemName);

        if (!applicableItems.length) msg.channel.send(`${msg.author.toString()} There are no items with the name \`${itemName}\`, it seems.`).catch(console.error);
        else if (applicableItems.length === 1) msg.channel.send({ files: [{ "name": `${applicableItems[0].name}.png`, "attachment": applicableItems[0].url }] }).catch(console.error);
        else
        {
            // collect user input for first random 10 items
            let embedItems = applicableItems.map(item => { return { name: item.name, value: (item.description.length) ? item.description : "No description." } });
            let collectorEmbed = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
                .setDescription(`There are a total of **${numberOfOtherItems}** items that match \`${itemName}\``)
                .setFooter(`${dClient.constants.discord.embed.footer.text} | ${dClient.modules.utils.fancyESODate(msg.createdAt)}`, dClient.constants.discord.embed.footer.icon_url);
            collectorEmbed.fieldValueLength = 50;

            dClient.modules.utils.createSelectorEmbed(msg, embedItems, collectorEmbed).then(function([itemNumber, collectorMessage])
            {
                let selectedItem = applicableItems[itemNumber - 1];

                let itemEmbed = new Discord.MessageEmbed(dClient.modules.utils.createEmptyRichEmbedObject())
                    .setColor(dClient.modules.utils.randColor())
                    .setAuthor(selectedItem.name, "", baseSummaryURL + selectedItem.id)
                    .setDescription(selectedItem.description)
                    .setImage(selectedItem.url)
                    .setFooter(`${dClient.constants.discord.embed.footer.text} | ${dClient.modules.utils.fancyESODate(msg.createdAt)}`, dClient.constants.discord.embed.footer.icon_url);

                collectorMessage.edit({ embed: itemEmbed }).catch(console.error);
            }).catch(console.error);
        }
    } catch (err)
    {
        console.error(err);
        msg.channel.send(":x: Something went wrong while looking for this item. If this keeps happening, talk to a developer over at <https://bot.grogsile.org/discord>.").catch(console.error);
    }
}

module.exports = esoItem;
