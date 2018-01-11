function ensureAttributesExist(form)
{
    let template = _templates.guild.eso.patchNotes;
    if (!form.hasOwnProperty("enabled")) form.enabled = false;
    if (!form.hasOwnProperty("channel")) form.channel = template.channel;
    return form;
}

function patchNotes(req, res, next)
{
    if (!req.body) return res.status(400).json({ code: "400", "error": "No form body received" });

    let config = dClient.guilds.get(req.params.id).config;
    let configSetting = config.eso.patchNotes;
    let body = utils.convertAllInputsToBoolean(ensureAttributesExist(req.body));

    config.guild.patchNotes = Object.assign(configSetting, body);
    config._save()
        .then(next)
        .catch(function(err)
        {
            console.error(err);
            res.status(500).json({ code: "500", error: err.message });
        });
}

module.exports = patchNotes;
