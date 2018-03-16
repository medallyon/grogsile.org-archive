function timeSince(date, addString = false)
{
    if ((typeof date) === "number") date = new Date(date);
    if (!(date instanceof Date)) throw new TypeError("{date} must be an instance of Date");

    let now = Date.now();
    let millisecondsSince = now - Date.parse(date);
    if (millisecondsSince < 0) millisecondsSince = millisecondsSince * -1;

    this.date = date;
    this.fullYears = (millisecondsSince / 12 / 30.436875 / 24 / 60 / 60 / 1000);
    this.fullMonths = (millisecondsSince / 30.436875 / 24 / 60 / 60 / 1000);
    this.fullWeeks = (millisecondsSince / 7 / 24 / 60 / 60 / 1000);
    this.fullDays = (millisecondsSince / 24 / 60 / 60 / 1000);
    this.fullHours = (millisecondsSince / 60 / 60 / 1000);
    this.fullMinutes = (millisecondsSince / 60 / 1000);
    this.fullSeconds = (millisecondsSince / 1000);

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
    if (this.seconds >= 1) output.push(`${(output.length > 0) ? "and " : ""}${this.seconds} Second${this.seconds === 1 ? "" : "s"}`);

    output = output.map((s, i, a) => (i < a.length - 1) ? (s + ",") : s);

    if (addString)
    {
        if (Date.parse(this.date) <= now) output.push("since");
        else output.push("until");

        output.push(this.date.toUTCString());
    }

    if (output.length === 0) output.push("No time has passed since " + this.date);
    return output.join(" ");
}

module.exports = timeSince;
