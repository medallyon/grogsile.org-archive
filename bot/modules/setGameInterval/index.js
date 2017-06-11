function applyGame(recentGames, gameArray)
{
    let game = gameArray.filter(g => recentGames.some(x => x !== g))[Math.floor(Math.random() * gameArray.length)];
    console.log(`CHOSEN GAME: ${game}`);
    recentGames.push(game);

    if (recentGames.length > 2) recentGames.shift();

    return dClient.user.setGame(game);
}

function setGameInterval(interval, gameArray = null)
{
    let recentGames = [];
    dClient.setInterval(function()
    {
        if (!gameArray)
        {
            fs.readJson(join(__dirname, "games.json"), function(err, games)
            {
                if (err) return console.error(err);

                console.log(recentGames);
                applyGame(recentGames, games).catch(console.error);
                console.log(recentGames);
            });
        }

        else
        {
            console.log(recentGames);
            applyGame(recentGames, gameArray).catch(console.error);
            console.log(recentGames);
        }
    }, interval);
}

module.exports = setGameInterval;
