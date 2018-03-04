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
    generateBirthdate(age = 21)
    {
        return [
            Math.floor(Math.random() * 28),
            Math.floor(Math.random() * 21),
            new Date().getFullUTCYear() - age
        ];
    }

    bypassAgeGate()
    {
        let self = this;
        return new Promise(async (resolve) =>
        {
            await self.page.type("#month", "01");
            await self.page.type("#day", "01");
            await self.page.type("#year", "1950");
            await self.page.$eval("form", form => form.submit());
            await self.page.waitFor(5*1000);

            resolve();
        });
    }
}

module.exports = WebsiteSession;
