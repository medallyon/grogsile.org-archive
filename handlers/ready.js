dClient.once("ready", () => {
    console.log(dClient.user.username + " is ready to serve.");

    if (dClient.config.restarted)
    {
        dClient.channels.get(dClient.config.restarted).sendMessage(":white_check_mark: Successfully restarted!");
        dClient.config.restarted = false;
    }
});
