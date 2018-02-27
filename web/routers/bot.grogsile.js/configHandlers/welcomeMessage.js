function ensureAttributesExist(form)
{
    let template = dClient.config.templates.guild.guild.welcomeMessage;
    if (!form.hasOwnProperty("enabled")) form.enabled = false;
    if (!form.hasOwnProperty("maxMembers")) form.maxMembers = template.maxMembers;
    if (!form.hasOwnProperty("message")) form.message = template.message;
    if (!form.hasOwnProperty("channel")) form.channel = template.channel;
    if (!form.hasOwnProperty("direct-enabled")) form["direct-enabled"] = false;
    if (!form.hasOwnProperty("direct-disableGuildWelcome")) form["direct-disableGuildWelcome"] = false;
    if (!form.hasOwnProperty("direct-message")) form["direct-message"] = template.direct.message;
    return form;
}

function welcomeMessage(req, res, next)
{
    if (!req.body) return res.status(400).json({ code: "400", "error": "No form body received" });

    let config = dClient.guilds.get(req.params.id).config;
    let configSetting = config.guild.welcomeMessage;
    let body = dClient.modules.utils.convertAllInputsToBoolean(ensureAttributesExist(req.body));

    body.direct = {
        enabled: body["direct-enabled"],
        disableGuildWelcome: body["direct-disableGuildWelcome"],
        message: body["direct-message"]
    };

    delete body["direct-enabled"];
    delete body["direct-disableGuildWelcome"];
    delete body["direct-message"];

    config.guild.welcomeMessage = Object.assign(configSetting, body);
    config._save()
        .then(next)
        .catch(function(err)
        {
            console.error(err);
            res.status(500).json({ code: "500", error: err.message });
        });
}

module.exports = welcomeMessage;
