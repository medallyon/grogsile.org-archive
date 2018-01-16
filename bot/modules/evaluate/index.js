const request = require("request");

function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        if (typeof evaluated === "undefined") evaluated = "undefined";

        if (evaluated instanceof Discord.MessageEmbed) msg.channel.send({ embed: evaluated }).catch(console.error);
        else msg.channel.send(evaluated, { code: "js" }).catch(console.error);
    } catch (err) {
        msg.channel.send(err.message, { code: "js" }).catch(console.error);
    }
}

module.exports = evaluate;
