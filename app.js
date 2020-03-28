const express = require('express')
const session = require('express-session');
const router = express.Router();
const getResults = require("./scraper");
const getCases = require("./getCases");
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
  res.send('COVID Hotline Bling Bot is running');
});

app.post('/sms', async function (req, res) {
  let smsCount = req.session.counter || 0;
  const respValues = req.session.respvalues || [];

  let message = `Hi! What's your zipcode? Once you let us know, please wait - it can take a few moments to pull the data.`;

  if(smsCount == 1) {
    if (postcodeValidator(req.body.Body, 'US')) {
      console.log(`post code is: ${req.body.Body}, and is valid.`);
      respValues.push(req.body.Body);
      casesInArea = await getCases(respValues[0]);
      const result = await getResults(respValues[0]);
      message = `There are ${casesInArea.cases} recorded cases and ${casesInArea.deaths} record deaths in your county. Your nearest county health center is the ${result.name}. You can call them at this number: ${result.phone}, or email them/visit their website here: ${result.email}.`;
      if(typeof result.name === undefined) {
        message = `No centers found. Sorry! Please try a different zipcode.`;
      }
    } else {
      console.log(`post code is invalid.`);
      message = `Please enter a valid zipcode.`
      smsCount = smsCount - 1;
    }
  }

  req.session.counter = smsCount + 1;
  req.session.respvalues = respValues;

  if(req.body.Body.toLowerCase() == `clear`) {
    req.session.respvalues = [];
    req.session.counter = 0;
    message = "You have cleared your information."
  }

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log('Example app listening on port 8000!')
});