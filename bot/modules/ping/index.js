// the main function
function ping(msg)
{
    let text = `Pong! (~${Date.now() - msg.performance}ms)`;
    if (msg.args.length > 0) {
        text = msg.args.join(" ");
    }
    msg.channel.sendMessage(text);
}

// this line makes this whole module accessible to other scripts that may want to import this module
module.exports = ping;
