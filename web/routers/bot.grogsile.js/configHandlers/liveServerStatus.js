function ensureAttributesExist(form)
{
    let template = _templates.guild.eso.liveServerStatus;
    if (!form.hasOwnProperty("panel-enabled")) form["panel-enabled"] = false;
    if (!form.hasOwnProperty("panel-channel")) form["panel-channel"] = template.panel.channel;
    if (!form.hasOwnProperty("update-enabled")) form["update-enabled"] = false;
    if (!form.hasOwnProperty("update-channel")) form["update-channel"] = template.update.channel;
    if (!form.hasOwnProperty("update-roles")) form["update-roles"] = template.update.roles;
    if (!form.hasOwnProperty("update-toggleRoles")) form["update-toggleRoles"] = false;
    if (!form.hasOwnProperty("update-deletePrevious")) form["update-deletePrevious"] = false;
    return form;
}

function liveServerStatus(req, res, next)
{
    if (!req.body) return res.status(400).json({ code: "400", "error": "No form body received" });

    let config = dClient.guilds.get(req.params.id).config;
    let configSetting = config.eso.liveServerStatus;
    let body = dClient.modules.utils.convertAllInputsToBoolean(ensureAttributesExist(req.body));

    body.panel = {
        enabled: body["panel-enabled"],
        channel: body["panel-channel"],
    };
    body.update = {
        enabled: body["update-enabled"],
        channel: body["update-channel"],
        roles: (body["roles-enabled"]) ? (Array.isArray(body["update-roles"]) ? body["update-roles"] : [ body["update-roles"] ]) : [],
        toggleRoles: body["update-toggleRoles"],
        deletePrevious: body["update-deletePrevious"]
    };

    delete body["panel-enabled"];
    delete body["panel-channel"];
    delete body["update-enabled"];
    delete body["update-channel"];
    delete body["update-roles"];
    delete body["update-toggleRoles"];
    delete body["update-deletePrevious"];
    delete body["roles-enabled"];

    config.guild.liveServerStatus = Object.assign(configSetting, body);
    config._save()
        .then(next)
        .catch(function(err)
        {
            console.error(err);
            res.status(500).json({ code: "500", error: err.message });
        });
}

module.exports = liveServerStatus;
