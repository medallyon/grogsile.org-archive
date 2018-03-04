function ensureAttributesExist(form)
{
    let template = dClient.config.templates.guild.guild.restricted;
    if (!form.hasOwnProperty("channels")) form.channels = template;
    return form;
}

function restrictChannels(req, res, next)
{
    if (!req.body) return res.status(400).json({ code: "400", "error": "No form body received" });

    let config = dClient.guilds.get(req.params.id).config;
    let configSetting = config.guild.restricted;
    let body = dClient.modules.utils.convertAllInputsToBoolean(ensureAttributesExist(req.body));

    body = Array.isArray(body.channels) ? body.channels : [ body.channels ];

    config.guild.restricted = body;
    config._save()
        .then(next)
        .catch(function(err)
        {
            console.error(err);
            res.status(500).json({ code: "500", error: err.message });
        });
}

module.exports = restrictChannels;
