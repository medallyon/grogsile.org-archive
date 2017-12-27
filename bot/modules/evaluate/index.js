const request = require("request");

function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        if (!evaluated) evaluated = "undefined";
        msg.channel.send(evaluated, { code: "js" }).catch(console.error);
    } catch (err) {
        msg.channel.send(err, { code: "js" }).catch(console.error);
    }
}

module.exports = evaluate;
