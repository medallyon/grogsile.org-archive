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
    if (dClient.maintenance) return dClient.user.setActivity("ESO: Maintenance").catch(console.error);

    fs.readJson(join(__dirname, "games.json")).then(function(games)
    {
        if (!Array.isArray(games) || !games.length) return console.error(new Error("Cannot apply new game since games.json file is empty or not an Array."));

        const game = chooseRandomGame(games);
        if (!game) return console.error(new Error(`'game' is not a game: ${game}`));

        dClient.user.setActivity(game).catch(console.error);
    }).catch(console.error);
}

module.exports = changePlayingGame;
