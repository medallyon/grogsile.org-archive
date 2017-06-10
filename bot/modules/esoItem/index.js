const request = require("request")
, cheerio = require("cheerio");

const baseSearchString = "http://esolog.uesp.net/viewlog.php?searchtype=minedItemSummary&search="
, baseImgURL = "http://esoitem.uesp.net/item-"
, baseImgModifiers = "-66-5.png";

function summarizeItem($item)
{
    return {
        name: $item.children().eq(3).text(),
        url: `${baseImgURL}${$item.children().eq(4).text()}${baseImgModifiers}`
    }
}

function searchUESPItem(item)
{
    return new Promise(function(resolve, reject)
    {
        request(`${baseSearchString}${item}`, (err, res, body) => {
            if (err) return reject(err);

            let $ = cheerio.load(body);

            if ($("table").children().length <= 1) return reject(`No items found matching '${item}'`);

            let $minedItem = $("table").children().eq(1);
            resolve(summarizeItem($minedItem));
        });
    });
}

function esoItem(msg, item)
{
    searchUESPItem(item)
    .then(itemObj => {
        msg.channel.send({ files: [{ "name": `${itemObj.name}.png`, "attachment": itemObj.url }] }).catch(console.error);
    }).catch(console.log);
}

module.exports = esoItem;
