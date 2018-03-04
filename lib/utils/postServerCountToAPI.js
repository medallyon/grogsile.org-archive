const request = require("request");

function postServerCountToAPI(urls = [])
{
    if (!urls.length) return console.error(new Error("No URLs provided"));

    // for (const url of urls)
    // {
    //     request({ url[1], method: "POST", headers: { Authorization: dClient.config.bot.api.keys[url[0]] }, body: { server_count: dClient.guilds.size } }, function(err, body, res)
    //     {
    //         if (err) console.error(err);
    //     });
    // }
}

module.exports = postServerCountToAPI;
