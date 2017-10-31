let recentActivities = { "PLAYING": [], "LISTENING": [], "WATCHING": [], "STREAMING": [] };

function chooseRandomActivity(activities)
{
    const validActivities = { "PLAYING": [], "LISTENING": [], "WATCHING": [], "STREAMING": [] };

    for (let type in activities)
    {
        validActivities[type] = activities[type].filter(x => !recentActivities[type].includes(x));
    }

    const type = Object.keys(activities)[Math.floor(Math.random() * Object.keys(activities).length)];
    const activity = validActivities[type][Math.floor(Math.random() * validActivities[type].length)];

    recentActivities[type].push(activity);
    if (recentActivities[type].length > Math.floor(activities[type].length * 0.2)) recentActivities[type].shift();

    return [activity, type];
}

function changeActivity()
{
    if (dClient.maintenance) return dClient.user.setActivity("ESO: Maintenance").catch(console.error);

    fs.readJson(join(__dirname, "activities.json")).then(function(activities)
    {
        const [activity, type] = chooseRandomActivity(activities);
        if (!activity) return console.error(new Error(`'activity' is not a activity: ${activity}`));

        dClient.user.setActivity(activity, { type }).catch(console.error);
    }).catch(console.error);
}

module.exports = changeActivity;
