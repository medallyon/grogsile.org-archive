function daysInMonth(month = null)
{
    if (!month)
        month = (new Date()).getUTCMonth();
    else if (month instanceof Date)
        month = month.getUTCMonth()

    if (month < 0 || month > 11)
        throw new RangeError("{month} must be between 0 and 11 (inclusive)");

    switch (month)
    {
        case 1:
            return 28;
        case 3:
        case 5:
        case 8:
        case 10:
            return 30;
        default:
            return 31;
    }
}

module.exports = daysInMonth;
