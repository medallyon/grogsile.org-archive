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
        if (this.page) this.page.close();
        if (this.browser) this.browser.close();

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

                        await self.page.goto(self.url);

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
            Math.floor(Math.random() * 21),
            new Date().getFullUTCYear() - minAge
        ];
    }

    bypassAgeGate()
    {
        let self = this;
        return new Promise(async (resolve) =>
        {
            const randomDate = this.generateBirthdate();

            await self.page.type("#month", randomDate[0]);
            await self.page.type("#day", randomDate[1]);
            await self.page.type("#year", randomDate[2]);

            await self.page.$eval("form", form => form.submit());
            await self.page.waitFor(5*1000);

            resolve();
        });
    }
}

module.exports = WebsiteSession;
