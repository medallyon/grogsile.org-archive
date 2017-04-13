function restart(msg)
{
    console.log(`Restarting in channel #${msg.channel.name}.`);
    dClient.restarted = msg.channel.id;
    process.exit();
}

module.exports = restart;
