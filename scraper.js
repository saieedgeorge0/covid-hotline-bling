const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const zipcodes = require("zipcodes");

const names = new Set();
const numbers = new Set();
const emailwebs = new Set();

const getResults = async (zipcode) => {
    const siteUrl = `https://www.naccho.org/membership/lhd-directory?searchType=zipCode&lhd-zip=${zipcode}&lhd-radius=25#card-filter`;
    console.log(siteUrl);

    console.log("fetching data");
    
    const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(siteUrl, {waitUntil: 'load', timeout: 0});

    let healthData = await page.evaluate(() => {
        let healths = [];
        let boardsofhealths = document.querySelectorAll('.card--lhd-listing__lhd > .card__text-container');
        boardsofhealths.forEach((boardelement) => {
            let healthJson = {};
            try {
                healthJson.name = boardelement.querySelector('h3').innerText;
                healthJson.phone = boardelement.querySelector('p > a').innerText;
                healthJson.email = boardelement.querySelector('p > strong > a').getAttribute("href");
                if (healthJson.email.includes("mailto:")) {
                    healthJson.email = healthJson.email.split(':')[1];
                }
                healthJson.zipcode = boardelement.querySelector('p').innerText.split('\n')[1].split('-');
                healthJson.zipcode = healthJson.zipcode[healthJson.zipcode.length-2];
                healthJson.zipcode = healthJson.zipcode.substr(healthJson.zipcode.length - 5);
            }
            catch (exception) {}
            healths.push(healthJson);
        });
        return healths;
    });

    console.log("Data fetched.");
    console.log("calculating closest center...");

    closestcenter = {};
    shortestdistance = 0;

    for (var i = 0; i < healthData.length; i++){
        var obj = healthData[i];

        if (i == 0) {
            shortestdistance = zipcodes.distance(zipcode, obj.zipcode);
            closestcenter = obj;
        } else {
            if (zipcodes.distance(zipcode, obj.zipcode) < shortestdistance) {
                shortestdistance = zipcodes.distance(zipcode, obj.zipcode);
                closestcenter = obj;
            }
        }
        console.log(shortestdistance);
    }

    console.log(closestcenter);
    return closestcenter;
};

module.exports = getResults;