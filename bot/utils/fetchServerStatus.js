const request = require("request")
, cheerio = require("cheerio");

const STATUS_DOMAIN = "https://eso.xc.ms/ajax";

// resolves with a discord.js Collection if successful
function fetchServerStatus()
{
    return new Promise(function(resolve, reject)
    {
        request(STATUS_DOMAIN, function(err, res, body)
        {
            if (err) return reject(err);

            let $ = cheerio.load(body);

            let servers = [];
            $(".list-group > .list-group-item").each(function()
            {
                servers.push($(this).text());
            });

            let status = {};
            status["PC"] = {
                "EU": servers.find(x => x.includes("(EU)")).includes("UP"),
                "NA": servers.find(x => x.includes("(NA)")).includes("UP"),
                "PTS": servers.find(x => x.includes("(PTS)")).includes("UP")
            };
            status["PS4"] = {
                "EU": servers.find(x => x.includes("(PS4 - EU)")).includes("UP"),
                "NA": servers.find(x => x.includes("(PS4 - US)")).includes("UP")
            };
            status["XBONE"] = {
                "EU": servers.find(x => x.includes("(XBox - EU)")).includes("UP"),
                "NA": servers.find(x => x.includes("(XBox - US)")).includes("UP")
            };

            resolve(status);
        });
    });
}

module.exports = fetchServerStatus;
