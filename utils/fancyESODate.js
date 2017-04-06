function fancyESODate(date) {
    let year = date.getUTCFullYear()
    , month, day = String(date.getUTCDate())
    , hours = date.getUTCHours()
    , minutes = date.getUTCMinutes();

    year = year.toString().replace(/.{2}/, year.toString()[0] + "E");

    switch (date.getUTCMonth()) {
        case 0:
            month = "Morning Star";
            break;
        case 1:
            month = "Sun's Dawn";
            break;
        case 2:
            month = "First Seed";
            break;
        case 3:
            month = "Rain's Hand";
            break;
        case 4:
            month = "Second Seed";
            break;
        case 5:
            month = "Midyear";
            break;
        case 6:
            month = "Sun's Height";
            break;
        case 7:
            month = "Last Seed";
            break;
        case 8:
            month = "Hearthfire";
            break;
        case 9:
            month = "Frostfall";
            break;
        case 10:
            month = "Sun's Dusk";
            break;
        case 11:
            month = "Evening Star";
            break;
    }

    if (!(day > 10 && day < 21)) {
        if (day.charAt(day.length - 1) === "1")
            day = day + "st";
        else

        if (day.charAt(day.length - 1) === "2")
            day = day + "nd";
        else

        if (day.charAt(day.length - 1) === "3")
            day = day + "rd";
        else
            day = day + "th";
    } else {
        day = day + "th";
    }

    return `${year}, ${day} day of ${month}`;
}

module.exports = fancyESODate;