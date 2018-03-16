const request = require("request")
, Discord = require("discord.js");

const dungeonImages = require(dClient.libs.join(__dirname, "images.json"));

const API_ENDPOINT = "https://api.grogsile.org/eso/pledges"
, UESP_DOMAIN = "uesp.net"
, UESP_PLEDGE_BASE_URL = "wiki/Online:Pledge:_"
, UESP_PLEDGE_WIKI_PAGE_URL = "http://en.uesp.net/wiki/Online:Undaunted";

function fetchCurrentPledges()
{
    return new Promise(function(resolve, reject)
    {
        request(API_ENDPOINT, function(err, res, body)
        {
            if (err) return reject(err);

            let currentPledges;
            try
            {
                currentPledges = JSON.parse(body);
                resolve(currentPledges);
            }
            catch (parsingError)
            {
                reject(parsingError);
            }
        });
    });
}

function nextPledgeDate()
{
    let nextDate = new Date();

    if (new Date().getUTCHours() >= 6) nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    nextDate.setUTCHours(6);
    nextDate.setUTCMinutes(0);
    nextDate.setUTCSeconds(0);

    return nextDate;
}

function createEmbed(pledges)
{
    let e = new Discord.MessageEmbed(dClient.constants.discord.embed)
        .setAuthor("Today's Pledges", dClient.user.displayAvatarURL())
        .setDescription(`These pledges refresh at approximately **6 AM UTC** (${dClient.modules.utils.timeSince(nextPledgeDate())})`);

    if (!Object.keys(pledges).includes("image"))
    {
        for (let questGiver in pledges)
            e.addField(questGiver, `[${pledges[questGiver][0]}](https://${UESP_DOMAIN}/${UESP_PLEDGE_BASE_URL}${pledges[questGiver][0].replace(/ /g, "_")})`);
        e.addBlankField();

        let nextPledges = [];
        for (let questGiver in pledges)
            nextPledges.push(pledges[questGiver][1]);
        e.addField("Upcoming Pledges", `*${nextPledges.map(p => "[" + p + "](https://" + UESP_DOMAIN + "/" + UESP_PLEDGE_BASE_URL + p.replace(/ /g, "_") + ")").join("*, *")}*`);
    }

    else
    {
        const questGiver = Object.keys(pledges)[1]
        , dungeonName = Object.values(pledges)[1];

        e.setAuthor(`Today's Pledge from ${questGiver}`, dClient.user.displayAvatarURL(), `${UESP_PLEDGE_WIKI_PAGE_URL}#${questGiver.replace(/ /g, "_")}.27s_Pledges`)
            .setTitle(dungeonName)
            .setURL(`https://${UESP_DOMAIN}/${UESP_PLEDGE_BASE_URL}${pledges[questGiver].replace(/ /g, "_")}`)
            .setImage(pledges.image || "");
    }

    return e;
}

function pledges(msg)
{
    fetchCurrentPledges()
        .then(function(currentPledges)
        {
            let requestedPledges = currentPledges;

            if (msg.args.length)
            {
                const questGiverNames = Object.keys(currentPledges);
                if (questGiverNames.some(q => q.toLowerCase().includes(msg.args.join(" ").toLowerCase())))
                {
                    let requestedPledge = questGiverNames.find(q => q.toLowerCase().includes(msg.args.join(" ").toLowerCase()));

                    requestedPledges = { image: dungeonImages[currentPledges[requestedPledge][0]] };
                    requestedPledges[requestedPledge] = currentPledges[requestedPledge][0];
                }
            }

            return msg.channel.send({ embed: createEmbed(requestedPledges) }).catch(console.error);
        }).catch(console.error);
}

module.exports = pledges;
