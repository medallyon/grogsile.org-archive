function restart(msg)
{
    console.log(`Restarting in channel #${msg.channel.name}.`);

    dClient.config.bot.restarted = msg.channel.id;
    dClient.libs.fs.outputJson(dClient.libs.join(__botdir, "config.json"), dClient.config.bot).then(function()
    {
        process.exit(0);
    }).catch(dClient.modules.utils.consoleError);
}

module.exports = function(msg)
{
    restart(msg);
};

module.exports.name = "restart";
module.exports.about = "Restarts the bot.";
module.exports.alias = [
    "restart"
];
module.exports.arguments = {};
module.exports.userPermissions = 900;
module.exports.example = "";
module.exports.function = restart;
