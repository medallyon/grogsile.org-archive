const Discord = require("discord.js")
, request = require("request")
, cheerio = require("cheerio");

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

const TRADE_CENTRE_BASE_URL = "https://us.tamrieltradecentre.com/pc/Trade/SearchResult?ItemID=&SortBy=Price&Order=asc&ItemNamePattern=";
function fetchTradeCentreData(item)
{
    return new Promise(function(resolve, reject)
    {
        const itemName = item.name.split(" ").join("+");
        const fullURL = `${TRADE_CENTRE_BASE_URL}${itemName}`;
        request(fullURL, function(err, res, body)
        {
            if (err)
                return reject(err);

            let $ = cheerio.load(body)
            , tradeObject = { item };

            if (!$(` tr.cursor-pointer `).length)
                return resolve(null);

            tradeObject.minPrice = $(` .gold-amount `).text().slice(0, $(` .gold-amount `).text().indexOf("X")).trim();
            tradeObject.listings = parseInt($(` ul.pagination > li `).last().prev().text()) * 10;
            tradeObject.url = fullURL;

            const lastSeenURL = `https://us.tamrieltradecentre.com/pc/Trade/SearchResult?ItemID=&SortBy=LastSeen&ItemNamePattern=${itemName}`;
            request(lastSeenURL, function(err, res, lastSeenBody)
            {
                if (err)
                    return reject(err);

                $ = cheerio.load(lastSeenBody);
                let lastSeenMinutes = $(` .gold-amount `).first().next().attr("data-mins-elapsed");
                tradeObject.lastSeen = ((lastSeenMinutes <= 5) ? "Now" : `${lastSeenMinutes} minutes ago`);

                resolve(tradeObject);
            });
        });
    });
}

async function esoItem(msg, itemName = null)
{
    if (msg.command && !msg.guild.config.guild.commands.esoItem.usage.command)
        return;

    if (msg.command)
        itemName = msg.args.join(" ");

    if (!itemName || !itemName.length)
        return;

    let applicableItems, numberOfOtherItems, selectedItem, collectorMessage;
    [ applicableItems, numberOfOtherItems ] = searchUESPItems(itemName);

    if (!applicableItems.length)
        return msg.channel.send(`${msg.author.toString()} There are no items with the name \`${itemName}\`, it seems.`).catch(dClient.modules.utils.consoleError);

    else if (applicableItems.length === 1)
        selectedItem = applicableItems[0];

    else
    {
        // collect user input for first random 10 items
        let embedItems = applicableItems.map(item => ({ name: item.name, value: (item.description.length) ? item.description : "No description." }));
        let collectorEmbed = new Discord.MessageEmbed(dClient.constants.discord.embed)
            .setDescription(`There are a total of **${numberOfOtherItems}** items that match \`${itemName}\``);
        collectorEmbed.fieldValueLength = 50;

        let selectedNumber;
        try
        {
            [ selectedNumber, collectorMessage ] = await dClient.modules.utils.createSelectorEmbed(msg, embedItems, collectorEmbed);
        }
        catch (error)
        {
            return dClient.modules.utils.consoleError(error);
        }

        selectedItem = applicableItems[selectedNumber - 1];
    }

    let embed = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor(selectedItem.name, "", baseSummaryURL + selectedItem.id)
        .setDescription(selectedItem.description || "")
        .setImage(selectedItem.url);

    if (!selectedItem.tradeCentreCooldown || (selectedItem.traceCentreCooldown && selectedItem.tradeCentreCooldown <= Date.now()))
    {
        selectedItem.tradeCentreCooldown = Date.now() + (1000 * 60 * 60 * 3);

        try
        {
            let tradeData = await fetchTradeCentreData(selectedItem);
            if (tradeData)
            {
                embed.addField("\u200b", "**Price Information**")
                    .addField("Lowest Price", `<:ESO_GOLD:457193059520741376> **${tradeData.minPrice}**`, true)
                    .addField("Last Seen", `**${tradeData.lastSeen}** [in ~${dClient.modules.utils.numberWithCommas(tradeData.listings)} listings](${tradeData.url})`, true);
            }
        }

        catch (error)
        {
            dClient.modules.utils.consoleError(error);
        }
    }

    else if (!selectedItem.tradeCentreCooldown)
        selectedItem.tradeCentreCooldown = Date.now() + (1000 * 60 * 60 * 3);

    // save item DB here

    if (collectorMessage)
        return collectorMessage.edit({ embed }).catch(dClient.modules.utils.consoleError);
    else
        return msg.channel.send({ embed }).catch(dClient.modules.utils.consoleError);
}

module.exports = function(msg, itemName = null)
{
    esoItem(msg, itemName);
};

module.exports.about = {
    name: "esoItem",
    description: "Searches for a given item from Elder Scrolls Online."
}
module.exports.alias = [
    "esoitem",
    "item"
];
module.exports.args = {
    input: {
        description: "The item to search for.",
        optional: false
    }
};
module.exports.userPermissions = 100;
module.exports.example = "Valkyn Skoria's Hat";
module.exports.function = esoItem;
