let recentActivities = { "PLAYING": [], "LISTENING": [], "WATCHING": [], "STREAMING": [] };

function chooseRandomActivity(activities)
{
    const validActivities = { "PLAYING": [], "LISTENING": [], "WATCHING": [], "STREAMING": [] };

    for (let type in activities)
        validActivities[type] = activities[type].filter(x => !recentActivities[type].includes(x));

    const type = Object.keys(activities)[Math.floor(Math.random() * Object.keys(activities).length)];
    const activity = validActivities[type][Math.floor(Math.random() * validActivities[type].length)];

    recentActivities[type].push(activity);
    if (recentActivities[type].length > Math.floor(activities[type].length * 0.2))
        recentActivities[type].shift();

    return [ activity, type ];
}

function changeActivity()
{
    if (dClient.maintenance)
        return dClient.user.setActivity("ESO: Maintenance").catch(dClient.modules.utils.consoleError);

    dClient.libs.fs.readJson(dClient.libs.join(__dirname, "activities.json")).then(function(activities)
    {
        const [ activity, type ] = chooseRandomActivity(activities);
        if (!activity)
            return dClient.modules.utils.consoleError(new Error(`'activity' is not an activity: ${activity}`));

        dClient.user.setActivity(activity, { type }).catch(dClient.modules.utils.consoleError);
    }).catch(dClient.modules.utils.consoleError);
}

module.exports = function()
{
    changeActivity();
};

module.exports.about = {
    name: "changeActivity",
    description: "Changes the current activity."
}
module.exports.alias = [];
module.exports.args = {};
module.exports.userPermissions = 10000;
module.exports.example = "";
module.exports.function = changeActivity;
