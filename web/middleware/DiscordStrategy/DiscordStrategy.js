/**
 * Base Script from https://github.com/nicholastay/passport-discord/
 */

var OAuth2Strategy      = require('passport-oauth2')
  , InternalOAuthError  = require('passport-oauth2').InternalOAuthError
  , util                = require('util');

class DiscordStrategy extends OAuth2Strategy
{
    constructor(options, verify)
    {
        options = options || {};
        options.authorizationURL = options.authorizationURL || 'https://discordapp.com/api/oauth2/authorize';
        options.tokenURL = options.tokenURL || 'https://discordapp.com/api/oauth2/token';
        options.scopeSeparator = options.scopeSeparator || ' ';

        super(options, verify);
        this.name = 'discord';
        this._oauth2.useAuthorizationHeaderforGET(true);
    }

    userProfile(accessToken, done)
    {
        this._oauth2.get('https://discordapp.com/api/users/@me', accessToken, (err, body, res) => {
            if (err) return done(new InternalOAuthError('Failed to fetch the user profile.', err));

            let profile = {};
            try {
                profile = JSON.parse(body);
            } catch (e) {
                return done(new Error('Failed to parse the user profile.'));
            }
            profile.provider = 'discord';

            this.checkScope('connections', accessToken, (errx, connections) => {
                if (errx) done(errx);
                if (connections) profile.connections = connections;
                this.checkScope('guilds', accessToken, function(erry, guilds) {
                    if (erry) done(erry);
                    if (guilds) profile.guilds = guilds;

                    return done(null, profile)
                });
            });
        });
    }

    checkScope(scope, accessToken, cb)
    {
        if (this._scope && this._scope.indexOf(scope) !== -1) {
            this._oauth2.get('https://discordapp.com/api/users/@me/' + scope, accessToken, function(err, body, res) {
                if (err) return cb(new InternalOAuthError('Failed to fetch user\'s ' + scope, err));
                try {
                    var json = JSON.parse(body);
                } catch (e) {
                    return cb(new Error('Failed to parse user\'s ' + scope));
                }
                cb(null, json);
            });
        } else {
            cb(null, null);
        }
    }

    authorizationParams(options)
    {
        var params = {};
        if (typeof options.permissions !== "undefined") {
            params.permissions = options.permissions;
        }
        return params;
    }
}

module.exports = DiscordStrategy;
