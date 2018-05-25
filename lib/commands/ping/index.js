function ping(msg)
{
    let text = `Pong! (~${Date.now() - msg.performance}ms)`;
    if (msg.args.length > 0)
        text = msg.args.join(" ");
    msg.channel.send(text).catch(dClient.modules.utils.consoleError);
}

module.exports = function(msg)
{
    ping(msg);
};

module.exports.name = "ping";
module.exports.about = "Pong!";
module.exports.alias = [
    "ping"
];
module.exports.arguments = {
    text: {
        description: "Text that will be displayed instead of the factory default 'Pong!'.",
        optional: true
    }
};
module.exports.userPermissions = 100;
module.exports.example = "CHIM";
module.exports.function = ping;
