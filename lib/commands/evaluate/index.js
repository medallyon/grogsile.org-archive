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
        if (typeof evaluated === "undefined" || !evaluated.length)
            evaluated = "undefined";

        if (evaluated instanceof Discord.MessageEmbed)
            msg.channel.send({ embed: evaluated }).catch(dClient.modules.utils.consoleError);
        else
            msg.channel.send(evaluated, { code: "js" }).catch(dClient.modules.utils.consoleError);
    }

    catch (err)
    {
        msg.channel.send(err.message, { code: "js" }).catch(dClient.modules.utils.consoleError);
    }
}

module.exports = function(msg)
{
    evaluate(msg);
};

module.exports.name = "evaluate";
module.exports.about = "Evaluates a valid JavaScript expression.";
module.exports.alias = [
    "evaluate",
    "eval"
];
module.exports.arguments = {};
module.exports.userPermissions = 900;
module.exports.example = "";
module.exports.function = evaluate;
