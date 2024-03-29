const join = require("path").join
, Discord = require("discord.js");

let constants = {
    discord: {},
    web: {}
};

// === [ WEB ] === //

constants.web.bot = {
    redirectURL: "https://bot.grogsile.org/callback"
};

// === [ BOT INVITE ] === //

constants.discord.bot = { inviteURL: "https://discordapp.com/oauth2/authorize?scope=bot&client_id=231606856663957505&permissions=339012678" };

// === [ ICONS ] === //
constants.icons = {
    "eso": "https://cdn.discordapp.com/icons/130716876937494528/5e66980df808cf1cdbaf73efaf36e6ee.png",
    "grogsile": "https://i.grogsile.org/favicon.png"
};

// === [ DISCORD ESOI ] ===

constants.discord.esoi = {
    "id":"130716876937494528",
    "inviteURL":"https://discordapp.com/invite/0jGipOeWW06jNmlL",
    "roles":{
        "EU":"130790997855567872",
        "NA":"130791016545517569",
        "PC":"391028205970259978",
        "PS4":"171037945761890304",
        "XBOne":"171038007313432576",
        "Aldmeri Dominion":"130747154758238208",
        "Daggerfall Covenant":"130747276166430721",
        "Ebonheart Pact":"130747239852277760",
        "yellow":"392077083440054273",
        "blue":"392077084790489099",
        "red":"392077061738463232",
        "Server Updates":"320931998959009804",
        "ESO News":"320932080966172672"
    },
    "emojis":{
        "misc":{
            "ouroboros":{
                "name":"a_ouroboros",
                "id":"231365141801730049",
                "emoji":"<:231365141801730049:a_ouroboros>"
            },
            "lol":{
                "name":"a_lol",
                "id":"236124911901343744",
                "emoji":"<:236124911901343744:a_lol>"
            },
            "WaitWhat":{
                "name":"a_WaitWhat",
                "id":"270273792222298112",
                "emoji":"<:270273792222298112:a_WaitWhat>"
            },
            "banned":{
                "name":"a_banned",
                "id":"245651296131088387",
                "emoji":"<:245651296131088387:a_banned>"
            },
            "AmuletOfKings":{
                "name":"a_AmuletOfKings",
                "id":"269563799256825856",
                "emoji":"<:269563799256825856:a_AmuletOfKings>"
            },
            "mudcrab":{
                "name":"a_mudcrab",
                "id":"270612632254283786",
                "emoji":"<:270612632254283786:a_mudcrab>"
            },
            "ZOS":{
                "name":"a_ZOS",
                "id":"284421839113945108",
                "emoji":"<:284421839113945108:a_ZOS>"
            },
            "CrownCrate":{
                "name":"a_CrownCrate",
                "id":"287340947384303618",
                "emoji":"<:287340947384303618:a_CrownCrate>"
            },
            "vivThink":{
                "name":"a_vivThink",
                "id":"310350675232161793",
                "emoji":"<:310350675232161793:a_vivThink>"
            }
        },
        "alliance":{
            "Aldmeri Dominion":{
                "name":"alliance_AldmeriDominion",
                "id":"231366333869064193",
                "emoji":"<:alliance_AldmeriDominion:231366333869064193>"
            },
            "Daggerfall Covenant":{
                "name":"alliance_DaggerfallCovenant",
                "id":"231366430094786562",
                "emoji":"<:alliance_DaggerfallCovenant:231366430094786562>"
            },
            "Ebonheart Pact":{
                "name":"alliance_EbonheartPact",
                "id":"231366236879978496",
                "emoji":"<:alliance_EbonheartPact:231366236879978496>"
            }
        },
        "class":{
            "templar":{
                "name":"class_templar",
                "id":"280056611802841089",
                "emoji":"<:class_templar:280056611802841089>"
            },
            "nightblade":{
                "name":"class_nightblade",
                "id":"280056611827875840",
                "emoji":"<:class_nightblade:280056611827875840>"
            },
            "sorcerer":{
                "name":"class_sorcerer",
                "id":"280056611962224640",
                "emoji":"<:class_sorcerer:280056611962224640>"
            },
            "dragonknight":{
                "name":"class_dragonknight",
                "id":"313754614270918657",
                "emoji":"<:class_dragonknight:313754614270918657>"
            },
            "warden":{
                "name":"class_warden",
                "id":"320931334681919489",
                "emoji":"<:class_warden:320931334681919489>"
            }
        },
        "role":{
            "dps":{
                "name":"role_dps",
                "id":"313745390535180288",
                "emoji":"<:role_dps:313745390535180288>"
            },
            "healer":{
                "name":"role_healer",
                "id":"313745390543568897",
                "emoji":"<:role_healer:313745390543568897>"
            },
            "tank":{
                "name":"role_tank",
                "id":"313745390560083969",
                "emoji":"<:role_tank:313745390560083969>"
            }
        },
        "race":{
            "altmer":{
                "name":"race_altmer",
                "id":"313797381684723722",
                "emoji":"<:race_altmer:313797381684723722>"
            },
            "bosmer":{
                "name":"race_bosmer",
                "id":"313797382246498306",
                "emoji":"<:race_bosmer:313797382246498306>"
            },
            "argonian":{
                "name":"race_argonian",
                "id":"313797382649282560",
                "emoji":"<:race_argonian:313797382649282560>"
            },
            "dunmer":{
                "name":"race_dunmer",
                "id":"313797384075476993",
                "emoji":"<:race_dunmer:313797384075476993>"
            },
            "breton":{
                "name":"race_breton",
                "id":"313797384112963584",
                "emoji":"<:race_breton:313797384112963584>"
            },
            "imperial":{
                "name":"race_imperial",
                "id":"313797384125808670",
                "emoji":"<:race_imperial:313797384125808670>"
            },
            "khajiit":{
                "name":"race_khajiit",
                "id":"313797384293318666",
                "emoji":"<:race_khajiit:313797384293318666>"
            },
            "redguard":{
                "name":"race_redguard",
                "id":"313797384553365504",
                "emoji":"<:race_redguard:313797384553365504>"
            },
            "nord":{
                "name":"race_nord",
                "id":"313797384578793492",
                "emoji":"<:race_nord:313797384578793492>"
            },
            "orc":{
                "name":"race_orc",
                "id":"313797384968732673",
                "emoji":"<:race_orc:313797384968732673>"
            }
        },
        "level":{
            "normal":{
                "name":"level_normal",
                "id":"313753139566346241",
                "emoji":"<:level_normal:313753139566346241>"
            },
            "champion":{
                "name":"level_champion",
                "id":"313753139725729793",
                "emoji":"<:level_champion:313753139725729793>"
            }
        },
        "potion":{
            "health":{
                "name":"potion_health",
                "id":"295599734712827905",
                "emoji":"<:potion_health:295599734712827905>"
            },
            "stamina":{
                "name":"potion_stamina",
                "id":"295599734855434241",
                "emoji":"<:potion_stamina:295599734855434241>"
            },
            "magicka":{
                "name":"potion_magicka",
                "id":"295599734876405771",
                "emoji":"<:potion_magicka:295599734876405771>"
            },
            "tristat":{
                "name":"potion_tristat",
                "id":"295600757762162699",
                "emoji":"<:potion_tristat:295600757762162699>"
            }
        },
        "face":{
            "ayrenn":{
                "name":"face_ayrenn",
                "id":"269564015016017920",
                "emoji":"<:face_ayrenn:269564015016017920>"
            },
            "vivec":{
                "name":"face_vivec",
                "id":"269564015963930645",
                "emoji":"<:face_vivec:269564015963930645>"
            },
            "emeric":{
                "name":"face_emeric",
                "id":"269564016018456576",
                "emoji":"<:face_emeric:269564016018456576>"
            },
            "SothaSil":{
                "name":"face_SothaSil",
                "id":"269564016274309139",
                "emoji":"<:face_SothaSil:269564016274309139>"
            },
            "jorunn":{
                "name":"face_jorunn",
                "id":"269564016530161664",
                "emoji":"<:face_jorunn:269564016530161664>"
            },
            "almalexia":{
                "name":"face_almalexia",
                "id":"269564022687399936",
                "emoji":"<:face_almalexia:269564022687399936>"
            },
            "naryu":{
                "name":"face_naryu",
                "id":"277928516467556352",
                "emoji":"<:face_naryu:277928516467556352>"
            }
        }
    }
};

// === [ DISCORD DEV SERVER ] === //

constants.discord.devServer = {
    inviteURL: "http://discord.gg/eKSPgvF"
};

// === [ DEFAULT EMBED ] === //

constants.discord.embed = {
    color: undefined,
    author: {
        name: "",
        icon_url: ""
    },
    title: "",
    url: "",
    description: "",
    fields: [],
    timestamp: "",
    footer: {
        icon_url: "https://i.grogsile.org/favicon.png",
        text: "Brought to you by Grogsile, Inc."
    }
};

constants.discord.errorEmbed = {
    color: "#bb0011",
    author: {
        name: "Error",
        icon_url: ""
    },
    title: "",
    url: "",
    description: "Something unexpected happened. If this keeps happening, tell a developer over at https//bot.grogsile.org/discord.",
    fields: [],
    timestamp: "",
    footer: {
        icon_url: "https://i.grogsile.org/favicon.png",
        text: "Brought to you by Grogsile, Inc."
    }
};

Object.defineProperty(constants.discord.embed, "color", {
    get()
    {
        return require(join(__lib, "utils", "randColor.js"))();
    }, configurable: true
});

// === [ API URLS ] === //

constants.apiURLS = [
    ["discordBotsOrg", "https://discordbots.org/api/bots/231606856663957505/stats"],
    ["botsDiscordPW", "https://bots.discord.pw/api/bots/231606856663957505/stats"]
];

module.exports = constants;
