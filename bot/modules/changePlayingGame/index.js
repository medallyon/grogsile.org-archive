let recentGames = [];

function applyGame(recentGames, games)
{
    const validGames = games.filter(g => !recentGames.includes(g));
    const game = validGames[Math.floor(Math.random() * validGames.length)];
    
    recentGames.push(game);
    if (recentGames.length > 3) recentGames.shift();

    return dClient.user.setGame(game);
}

function changePlayingGame(gameArray = null)
{
    if (!gameArray)
    {
        fs.readJson(join(__dirname, "games.json"), function(err, games)
        {
            if (err) return console.error(err);

            applyGame(recentGames, games).catch(console.error);
        });
    }

    else applyGame(recentGames, gameArray).catch(console.error);
}

module.exports = changePlayingGame;
