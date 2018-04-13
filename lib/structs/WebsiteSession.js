const puppeteer = require("puppeteer");

const ESO_DOMAIN = "elderscrollsonline.com";

class WebsiteSession
{
    constructor(url)
    {
        this.url = url;
        this.args = ["--no-sandbox"];

        this.browser = undefined;
        this.page = undefined;
        this.body = undefined;
    }

    destroy()
    {
        this.page = null;
        this.browser = null;
    }

    init()
    {
        let self = this;
        return new Promise(function(resolve, reject)
        {
            puppeteer.launch({ args: self.args })
                .then(async (browser) =>
                {
                    try
                    {
                        self.browser = browser;
                        self.page = await self.browser.newPage();

                        await self.page.goto(self.url, { timeout: 300000 });

                        if (self.page.url().includes(ESO_DOMAIN) && self.page.url().includes("agegate"))
                            await self.bypassAgeGate();

                        self.body = await self.page.content();

                        resolve(self.page);
                    }

                    catch (err)
                    {
                        reject(err);
                    }
                }).catch(reject);
        });
    }

    // returns [ day, month, year ]
    generateBirthdate(minAge = 21)
    {
        return [
            Math.floor(Math.random() * 28),
            Math.floor(Math.random() * 12),
            new Date().getUTCFullYear() - minAge
        ];
    }

    bypassAgeGate()
    {
        let self = this;
        return new Promise(async (resolve) =>
        {
            await self.page.type("#day", "21");
            await self.page.type("#month", "11");
            await self.page.type("#year", "1969");

            let submitElement = await self.page.$("#year");
            await submitElement.press("Enter");

            await self.page.waitFor(5*1000);

            resolve();
        });
    }
}

module.exports = WebsiteSession;
