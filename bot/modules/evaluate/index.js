const request = require("request");

function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        if (typeof evaluated === "undefined") evaluated = "undefined";
        msg.channel.send(evaluated, { code: "js" }).catch(console.error);
    } catch (err) {
        msg.channel.send(err.stack, { code: "js" }).catch(console.error);
    }
}

module.exports = evaluate;
