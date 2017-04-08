function getUptimeString(uptime)
{
    let months = (uptime / 30.436875 / 24 / 60 / 60 / 1000).toFixed()
    , days = ((uptime / 24 / 60 / 60 / 1000) % 30.436875).toFixed()
    , hours = ((uptime / 60 / 60 / 1000) % 24).toFixed()
    , minutes = ((uptime / 60 / 1000) % 60).toFixed()
    , seconds = ((uptime / 1000) % 60).toFixed()
    , output = "";

    if (months >= 1) {
        output = `${months} Month${months === 1 ? "" : "s"}, ${days} Day${days === 1 ? "" : "s"}, ${hours} Hour${hours === 1 ? "" : "s"}, ${minutes} Minute${minutes === 1 ? "" : "s"} and ${seconds} Second${seconds === 1 ? "" : "s"}.`;
    } else
    if (days >= 1) {
        output = `${days} Day${days === 1 ? "" : "s"}, ${hours} Hour${hours === 1 ? "" : "s"}, ${minutes} Minute${minutes === 1 ? "" : "s"} and ${seconds} Second${seconds === 1 ? "" : "s"}.`;
    } else
    if (hours >= 1) {
        output = `${hours} Hour${hours === 1 ? "" : "s"}, ${minutes} Minute${minutes === 1 ? "" : "s"} and ${seconds} Second${seconds === 1 ? "" : "s"}.`;
    } else
    if (minutes >= 1) {
        output = `${minutes} Minute${minutes === 1 ? "" : "s"} and ${seconds} Second${seconds === 1 ? "" : "s"}.`;
    } else
    if (seconds >= 1) {
        output = `${seconds} Second${seconds === 1 ? "" : "s"}.`;
    }

    return output;
}

module.exports = getUptimeString;
