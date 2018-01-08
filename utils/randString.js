// Courtesy of https://codepen.io/gabrieleromanato/pen/somEG

function randString(length = 16)
{
    let str = "";
    for ( ; str.length < length; str += Math.random().toString( 36 ).substr( 2 ) );
    return str.substr( 0, length );
}

module.exports = randString;
