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
                    console.log(1);
                    try
                    {
                        self.browser = browser;
                        self.page = await self.browser.newPage();
                        console.log(2);

                        await self.page.goto(self.url);
                        console.log(3);

                        if (self.page.url().includes(ESO_DOMAIN) && self.page.url().includes("agegate"))
                            await self.bypassAgeGate();

                        console.log(4);

                        self.body = await self.page.content();

                        console.log(5);

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
            console.log(3.1);
            await self.page.waitFor(5*1000);
            console.log(3.2);

            resolve();
        });
    }
}

module.exports = WebsiteSession;
