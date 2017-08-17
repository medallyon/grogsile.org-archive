let recentGames = [];

function chooseRandomGame(games)
{
    const validGames = games.filter(x => !recentGames.includes(x));
    const game = validGames[Math.floor(Math.random() * validGames.length)];

    recentGames.push(game);
    if (recentGames.length > Math.floor(games.length * 0.2)) recentGames.shift();

    return game;
}

function changePlayingGame()
{
    fs.readJson(join(__dirname, "games.json"), function(err, games)
    {
        if (err) return console.error(err);

        if (!Array.isArray(games) || !games.length) return console.error(new Error("Cannot apply new game since games.json file is empty or not an Array."));

        const game = chooseRandomGame(games);
        if (!game) return console.error(new Error(`'game' is not a game: ${game}`));

        dClient.user.setGame(game).catch(console.error);
    });
}

module.exports = changePlayingGame;
