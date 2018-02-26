function restart(msg)
{
    console.log(`Restarting in channel #${msg.channel.name}.`);

    dClient.config.bot.restarted = msg.channel.id;
    dClient.libs.fs.outputJson(dClient.libs.join(__botdir, "config.json"), dClient.config.bot).then(function()
    {
        process.exit(0);
    }).catch(console.error);
}

module.exports = restart;
