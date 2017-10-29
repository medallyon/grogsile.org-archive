function restart(msg)
{
    console.log(`Restarting in channel #${msg.channel.name}.`);

    dClient.config.restarted = msg.channel.id;
    fs.outputJson(join(__botdir, "config.json"), dClient.config).then(function()
    {
        process.exit(0);
    }).catch(console.error);
}

module.exports = restart;
