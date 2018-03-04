const Request = require("request");

const agegateURL = "http://www.elderscrollsonline.com/en-us/agegate"
, formData = {
    month: "11",
    day: "21",
    year: "1998"
};

class ESOWebsiteSession
{
    constructor(options = null)
    {
        this.options = {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
            },
            jar: true
        };

        if (options) Object.assign(this.options, options);

        this.request = Request.defaults(this.options);
    }

    init()
    {
        return new Promise((resolve, reject) => {
            this.request.post({ url: agegateURL, formData: formData }, (err, res, body) => {
                if (err) return reject(err);

                resolve(this.request);
            });
        });
    }
}

module.exports = ESOWebsiteSession;
