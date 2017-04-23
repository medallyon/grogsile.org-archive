function timeSince(date)
{
    this.date = date;
    this.fullYears = (date / 12 / 30.436875 / 24 / 60 / 60 / 1000);
    this.fullMonths = (date / 30.436875 / 24 / 60 / 60 / 1000);
    this.fullWeeks = (date / 7 / 24 / 60 / 60 / 1000);
    this.fullDays = (date / 24 / 60 / 60 / 1000);
    this.fullHours = (date / 60 / 60 / 1000);
    this.fullMinutes = (date / 60 / 1000);
    this.fullSeconds = (date / 1000);

    this.seconds = Math.floor(this.fullSeconds % 60);
    this.minutes = Math.floor(this.fullMinutes % 60);
    this.hours = Math.floor(this.fullHours % 24);
    this.days = Math.floor(this.fullDays % 30.436875);
    this.weeks = Math.floor(this.fullWeeks % 4);
    this.months = Math.floor(this.fullMonths % 12);
    this.years = Math.floor(this.fullYears);

    let output = [];
    if (this.years >= 1) output.push(`${this.years} Year${this.years === 1 ? "" : "s"}`);
    if (this.months >= 1) output.push(`${this.months} Month${this.months === 1 ? "" : "s"}`);
    if (this.weeks >= 1) output.push(`${this.weeks} Week${this.weeks === 1 ? "" : "s"}`);
    if (this.days >= 1) output.push(`${this.days} Day${this.days === 1 ? "" : "s"}`);
    if (this.hours >= 1) output.push(`${this.hours} Hour${this.hours === 1 ? "" : "s"}`);
    if (this.minutes >= 1) output.push(`${this.minutes} Minute${this.minutes === 1 ? "" : "s"}`);
    if (this.seconds >= 1) output.push(`${this.seconds} Second${this.seconds === 1 ? "" : "s"}`);

    if (output.length === 0) output.push("No time has passed since " + this.date);
    return output.join(" ");
}

module.exports = timeSince;
