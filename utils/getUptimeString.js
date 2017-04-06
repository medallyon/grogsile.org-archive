function getUptimeString(uptime)
{
    let months = (uptime / 30.436875 / 24 / 60 / 60 / 1000).toFixed()
    , days = (uptime / 24 / 60 / 60 / 1000).toFixed()
    , hours = (uptime / 60 / 60 / 1000).toFixed()
    , minutes = (uptime / 60 / 1000).toFixed()
    , seconds = (uptime / 1000).toFixed()
    , output = "";

    if (months >= 1) {
        output = `${months} Months, ${days} Days, ${hours} Hours, ${minutes} Minutes and ${seconds} Seconds.`;
    } else
    if (days >= 1) {
        output = `${days} Days, ${hours} Hours, ${minutes} Minutes and ${seconds} Seconds.`;
    } else
    if (hours >= 1) {
        output = `${hours} Hours, ${minutes} Minutes and ${seconds} Seconds.`;
    } else
    if (minutes >= 1) {
        output = `${minutes} Minutes and ${seconds} Seconds.`;
    } else
    if (seconds >= 1) {
        output = `${seconds} Seconds.`;
    }

    return output;
}

module.exports = getUptimeString;
