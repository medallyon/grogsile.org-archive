const fs = require("fs-extra");

function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        msg.channel.sendMessage("```js\n" + evaluated + "```");
    } catch (err) {
        msg.channel.sendMessage("```js\n" + err + "```");
    }
}

module.exports = evaluate;
