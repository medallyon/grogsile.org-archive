// guild : Discord.Guild, config : Object
function treatConfig(guild, config)
{
    config._guild = guild;
    config._path = dClient.libs.join(__data, "guilds", guild.id, "config.json");

    Object.defineProperty(config, "raw", { get: function()
    {
        let shallowCopy = Object.assign({}, config);

        delete shallowCopy._guild;
        delete shallowCopy._path;
        delete shallowCopy._save;
        delete shallowCopy._saveSync;
        delete shallowCopy._reload;

        return shallowCopy;
    } });

    // Object : data, Boolean : merge
    config._save = function(data = null, merge = true)
    {
        return new Promise(function(resolve, reject)
        {
            let _guild = config._guild;
            let _path = config._path;
            let _save = config._save;
            let _saveSync = config._saveSync;
            let _reload = config._reload;

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
            if (data._saveSync) delete data._saveSync;
            if (data._reload) delete data._reload;
            if (data.raw) delete data.raw;

            dClient.libs.fs.outputJson(_path, data, { spaces: 2 }).then(function()
            {
                config = data;
                config.raw = JSON.parse(JSON.stringify(data));

                _guild.config = config;

                config._guild = _guild;
                config._path = _path;
                config._save = _save;
                config._saveSync = _saveSync;
                config._reload = _reload;

                resolve();
            }).catch(reject);
        });
    };

    config._saveSync = function(data = null, merge = true)
    {
        let _guild = config._guild;
        let _path = config._path;
        let _save = config._save;
        let _saveSync = config._saveSync;
        let _reload = config._reload;

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
        if (data._saveSync) delete data._saveSync;
        if (data._reload) delete data._reload;
        if (data.raw) delete data.raw;

        dClient.libs.fs.outputJsonSync(_path, data, { spaces: 2 });

        config = data;
        config.raw = JSON.parse(JSON.stringify(data));

        _guild.config = config;

        config._guild = _guild;
        config._path = _path;
        config._save = _save;
        config._saveSync = _saveSync;
        config._reload = _reload;
    };

    config._reload = function()
    {
        return new Promise(function(resolve, reject)
        {
            dClient.libs.fs.readJson(config._path).then(function(data)
            {
                let intermediateVars = {
                    _guild: config._guild,
                    _path: config._path,
                    _save: config._save,
                    _saveSync: config._saveSync,
                    _reload: config._reload
                };

                config = data;
                config = Object.assign(config, intermediateVars);

                resolve(config);
            }).catch(reject);
        });
    };

    return config;
}

module.exports = treatConfig;
