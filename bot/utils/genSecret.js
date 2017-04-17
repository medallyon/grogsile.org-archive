function genSecret()
{
    let text = ""
    , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 36; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = genSecret;
