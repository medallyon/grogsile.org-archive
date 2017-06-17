function evaluate(msg)
{
    try {
        let evaluated = eval(msg.args.join(" "));
        msg.channel.send((evaluated !== undefined ? evaluated : "undefined"), { code: "js" });
    } catch (err) {
        msg.channel.send(err, { code: "js" });
    }
}

module.exports = evaluate;
