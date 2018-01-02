const decache = require("decache");

function implementReload(scriptName, path, group)
{
    return function()
    {
        decache(path);
        delete group[scriptName];

        group[scriptName] = require(path);
        group[scriptName].reload = implementReload(scriptName, path, group);

        return "Module successfully reloaded";
    }
}

module.exports = implementReload;
