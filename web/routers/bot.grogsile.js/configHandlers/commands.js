function ensureAttributesExist(form)
{
    let template = _templates.guild.guild.commands;
    for (let c in template)
    {
        if (!form.hasOwnProperty(`${c}-enabled`)) form[`${c}-enabled`] = false;
        if (["evaluate", "reload", "restart"].some(x => x === c)) form[`${c}-enabled`] = true;
    }
    if (!form.hasOwnProperty("esoItem-usage-command")) form["esoItem-usage-command"] = false;
    if (!form.hasOwnProperty("esoItem-usage-inline")) form["esoItem-usage-inline"] = false;
    return form;
}

function commands(req, res, next)
{
    if (!req.body) return res.status(400).json({ code: "400", "error": "No form body received" });

    let config = dClient.guilds.get(req.params.id).config;
    let configSetting = config.guild.commands;
    let body = utils.convertAllInputsToBoolean(ensureAttributesExist(req.body));

    for (let c in body)
    {
        if (c.endsWith("-enabled"))
        {
            body[c.replace("-enabled", "")] = { enabled: body[c] };
            delete body[c];
        }
    }
    body.esoItem.usage = {
        command: body["esoItem-usage-command"],
        inline: body["esoItem-usage-inline"]
    };
    delete body["esoItem-usage-command"];
    delete body["esoItem-usage-inline"];

    console.log(configSetting);
    console.log(body);

    config._save({ commands: Object.assign(configSetting, body) })
        .then(next)
        .catch(function(err)
        {
            console.error(err);
            res.status(500).json({ code: "500", error: err.message });
        });
}

module.exports = commands;
