class timeSince
{
    constructor(date)
    {
        this.date = date;
        this.fullYears = (date / 12 / 30.436875 / 24 / 60 / 60 / 1000);
        this.fullMonths = (date / 30.436875 / 24 / 60 / 60 / 1000);
        this.fullWeeks = (date / 7 / 24 / 60 / 60 / 1000);
        this.fullDays = (date / 24 / 60 / 60 / 1000);
        this.fullHours = (date / 60 / 60 / 1000);
        this.fullMinutes = (date / 60 / 1000);
        this.fullSeconds = (date / 1000);
    }

    get seconds()
    {
        return Math.floor(this.fullSeconds % 60);
    }

    get minutes()
    {
        return Math.floor(this.fullMinutes % 60);
    }

    get hours()
    {
        return Math.floor(this.fullHours % 24);
    }

    get days()
    {
        return Math.floor(this.fullDays % 30.436875);
    }

    get weeks()
    {
        return Math.floor(this.fullWeeks % 4);
    }

    get months()
    {
        return Math.floor(this.fullMonths % 12);
    }

    get years()
    {
        return Math.floor(this.fullYears);
    }

    secondString()
    {
        return `${this.seconds} Second${this.seconds === 1 ? "" : "s"}`;
    }

    minuteString()
    {
        return `${this.minutes} Minute${this.minutes === 1 ? "" : "s"}`;
    }

    hourString()
    {
        return `${this.hours} Hour${this.hours === 1 ? "" : "s"}`;
    }

    dayString()
    {
        return `${this.days} Day${this.days === 1 ? "" : "s"}`;
    }

    weekString()
    {
        return `${this.weeks} Week${this.weeks === 1 ? "" : "s"}`;
    }

    monthString()
    {
        return `${this.months} Month${this.months === 1 ? "" : "s"}`;
    }

    yearString()
    {
        return `${this.years} Year${this.years === 1 ? "" : "s"}`;
    }

    get timeString()
    {
        let output = [];
        if (this.years >= 1) output.push(this.yearString());
        if (this.months >= 1) output.push(this.monthString());
        if (this.weeks >= 1) output.push(this.weekString());
        if (this.days >= 1) output.push(this.dayString());
        if (this.hours >= 1) output.push(this.hourString());
        if (this.minutes >= 1) output.push(this.minuteString());
        if (this.seconds >= 1) output.push(this.secondString());

        if (output.length === 0) output.push("No time has passed since " + this.date);
        return output.join(" ");
    }
}

module.exports = timeSince;
