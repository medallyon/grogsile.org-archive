const baseImgURL = "http://esoitem.uesp.net/item-"
, baseImgModifier = "-66-5.png";

function deduceItemSummary([item, number])
{
    return [{
        name: item.name,
        url: baseImgURL + item.id + baseImgModifier
    }, number];
}

function findItem(itemCollection, item)
{
    // check if requested item is itemID
    if (itemCollection.has(item)) return itemCollection.get(item);

    // check if requested item is item.name
    if (itemCollection.exists("name", item)) return itemCollection.find("name", item);

    // filter out items containing requested item's words
    let matchingItems = itemCollection.filter(x => x.name.toLowerCase().includes(item.toLowerCase()));
    console.log(matchingItems.size);

    if (matchingItems.size === 1) return matchingItems.first();

    if (matchingItems.size === 0) return null;

    if (matchingItems.size > 1)
    {
        return [matchingItems.array()[Math.floor(Math.random() * matchingItems.size)], matchingItems.size];
    }
}

function searchUESPItem(item)
{
    return new Promise(function(resolve, reject)
    {
        fs.readJson(join(__dirname, "items.json"), (err, items) => {
            if (err) return reject(err);

            let foundItem = findItem(new Discord.Collection(items), item);

            if (foundItem) resolve(deduceItemSummary(foundItem));
            else reject(`Item '${item}' not found`);
        });
    });
}

function esoItem(msg, item)
{
    searchUESPItem(item)
    .then(([itemObj, otherItems]) => {
        msg.channel.send((otherItems > 1) ? `There are **${otherItems}** other items like this one` : "", { files: [{ "name": `${itemObj.name}.png`, "attachment": itemObj.url }] }).catch(console.error);
    }).catch(console.log);
}

module.exports = esoItem;
