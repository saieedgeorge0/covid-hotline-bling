const express = require('express')
const session = require('express-session');
const router = express.Router();
const getResults = require("./scraper");
const getCases = require("./getCases");
const getAllCases = require("./getAllCases");
const getRawCases = require("./getRawCases");
const { urlencoded } = require('body-parser');
const { postcodeValidator, postcodeValidatorExists } = require('postcode-validator');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();
app.use(urlencoded({ extended: false}));
app.use(session({secret: 'anything-you-want-but-keep-secret'}));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.get("/", async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://covid-hotline-bling.herokuapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send('COVID Hotline Bling Bot is running');
});

app.get("/zipcode/:id?", async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://covid-hotline-bling.herokuapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var zipcode = req.params.id;
  casesInAreaArray = await getCases(zipcode);
  yourfip = casesInAreaArray[0];
  yourfip.recentdate = casesInAreaArray[1];
  res.json(yourfip);
});

app.get("/dataallfips/:id?", async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://covid-hotline-bling.herokuapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.params.id == "raw") {
    console.log("raw");
    rawCases = await getRawCases();
    res.json(rawCases);
  }
  else {
    console.log("notraw");
    allCases = await getAllCases();
    res.json(allCases);
  }
});

app.post('/sms', async function (req, res) {
  let smsCount = req.session.counter || 0;
  const respValues = req.session.respvalues || [];

  let message = `Hi! I can provide you with case/death numbers for your county as well as information for your nearest public health center. What's your zipcode? Once you let us know, please wait - it can take a few moments to pull the data.`;

  if(smsCount == 1) {
    if (postcodeValidator(req.body.Body, 'US')) {
      console.log(`post code is: ${req.body.Body}, and is valid.`);
      respValues.push(req.body.Body);
      casesInAreaArray = await getCases(respValues[0]);
      casesInArea = casesInAreaArray[0];
      mostRecentTime = casesInAreaArray[1];
      const result = await getResults(respValues[0]);
      message = `As of ${mostRecentTime}, there are ${casesInArea.cases} recorded cases and ${casesInArea.deaths} recorded deaths in your county (data from NYTimes). Your nearest county health center is the ${result.name}. You can call them at this number: ${result.phone}, or email them/visit their website here: ${result.email} (Information from NACCHO). Type "clear" to enter a new zip code.`;
      if (typeof result.name === undefined) {
        message = `As of ${mostRecentTime}, there are ${casesInArea.cases} recorded cases and ${casesInArea.deaths} recorded deaths in your county (data from NYTimes). No centers found. Sorry! Please try a different zipcode.`;
      }
      if (typeof casesInArea.cases === undefined){
        message = `No cases found in your area (or the NYTimes does not have data for it). Your nearest county health center is the ${result.name}. You can call them at this number: ${result.phone}, or email them/visit their website here: ${result.email} (Information from NACCHO). Type "clear" to enter a new zip code.`;
      }
    } else {
      console.log(`post code is invalid.`);
      message = `Please enter a valid zipcode.`
      smsCount = smsCount - 1;
    }
  }

  req.session.counter = smsCount + 1;
  req.session.respvalues = respValues;

  if(smsCount > 1) {
    req.session.respvalues = [];
    req.session.counter = 1;
    message = "Enter a new zip code."
  }

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log('Example app listening on port 8000!')
});