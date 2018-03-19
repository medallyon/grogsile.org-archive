const request = require("request")
, Discord = require("discord.js");

function runEvalInContext()
{
    let msg = this;
    return eval(msg.args.join(" "));
}

function evaluate(msg)
{
    try
    {
        let evaluated = runEvalInContext.call(msg);
        if (typeof evaluated === "undefined") evaluated = "undefined";

        if (evaluated instanceof Discord.MessageEmbed) msg.channel.send({ embed: evaluated }).catch(console.error);
        else msg.channel.send(evaluated, { code: "js" }).catch(console.error);
    } catch (err)
    {
        msg.channel.send(err.message, { code: "js" }).catch(console.error);
    }
}

module.exports = evaluate;
