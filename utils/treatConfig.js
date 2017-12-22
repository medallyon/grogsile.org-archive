// Discord.Guild : guild, Object : object
function treatConfig(guild, config)
{
    config._guild = guild;
    config._path = join(__data, "guilds", guild.id, "config.json");

    // Object : data, Boolean : merge
    config._save = function(data = null, merge = true)
    {
        return new Promise(function(resolve, reject)
        {
            _guild = config._guild;
            _path = config._path;
            _save = config._save;
            
            if (data !== null)
            {
                if (merge)
                {
                    Object.assign(config, data);
                    data = config;
                } else config = data;
            } else data = config;

            if (data._guild) delete data._guild;
            if (data._path) delete data._path;
            if (data._save) delete data._save;

            fs.outputJson(_path, data, { spaces: 2 }).then(function()
            {
                config._guild = _guild;
                config._path = _path;
                config._save = _save;

                resolve(config);
            }).catch(reject);
        });
    }

    config._reload = function()
    {
        return new Promise(function(resolve, reject)
        {
            fs.readJson(config._path).then(function(data)
            {
                let intermediateVars = {
                    _guild: config._guild,
                    _path: config._path,
                    _save: config._save,
                    _reload: config._reload
                }

                config = data;
                config = Object.assign(config, intermediateVars);

                resolve(config);
            }).catch(reject);
        });
    }

    return config;
}

module.exports = treatConfig;
