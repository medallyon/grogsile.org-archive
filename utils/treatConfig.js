// Discord.Guild : guild, Object : object
function treatConfig(guild, config)
{
    config._guild = guild;
    config._path = join(__data, "guilds", guild.id, "config.json");

    Object.defineProperty(config, "raw", { get: function()
    {
        let shallowCopy = Object.assign({}, config);

        delete shallowCopy._guild;
        delete shallowCopy._path;
        delete shallowCopy._save;
        delete shallowCopy._reload;

        return shallowCopy;
    } });

    // Object : data, Boolean : merge
    config._save = function(data = null, merge = true)
    {
        return new Promise(function(resolve, reject)
        {
            _guild = config._guild;
            _path = config._path;
            _save = config._save;
            _reload = config._reload;
            
            if (data !== null)
            {
                if (merge)
                {
                    config = Object.assign(config, data);
                    data = config;
                } else config = data;
            } else data = config;

            if (data._guild) delete data._guild;
            if (data._path) delete data._path;
            if (data._save) delete data._save;
            if (data._reload) delete data._reload;
            if (data.raw) delete data.raw;

            fs.outputJson(_path, data, { spaces: 2 }).then(function()
            {
                config = data;
                config.raw = JSON.parse(JSON.stringify(data));

                _guild.config = config;
                
                config._guild = _guild;
                config._path = _path;
                config._save = _save;
                config._reload = _reload;

                resolve();
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
