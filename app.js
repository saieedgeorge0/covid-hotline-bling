const express = require('express')
const session = require('express-session');
const router = express.Router();
const getResults = require("./scraper");
const { urlencoded } = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();
app.use(urlencoded({ extended: false}));
app.use(session({secret: 'anything-you-want-but-keep-secret'}));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.get("/", async function(req, res) {
  console.log("about to perform get request");
  const result = await getResults(`15108`);
  let message = `Your nearest center is the ${result.name}. You can call them at this number: ${result.phone}, or email them/visit their website here: ${result.email}.`;
  console.log(message);
  res.send('COVID Hotline Bling Bot is running');
});

app.post('/sms', async function (req, res) {
  const smsCount = req.session.counter || 0;
  const respValues = req.session.respvalues || [];

  let message = `What state do you live in?`;

  if(smsCount == 1) {
    respValues.push(req.body.Body);
    message = `Which county within ${respValues[0]} do you currently reside?`;
  }

  if(smsCount == 2) {
    respValues.push(req.body.Body);
    message = `What's your zip code? Once you let us know, please wait - it can take a few moments to pull the data.`;
  }

  if(smsCount == 3) {
    respValues.push(req.body.Body);
    const result = await getResults(respValues[2]);
    message = `Your nearest center is the ${result.name}. You can call them at this number: ${result.phone}, or email them/visit their website here: ${result.email}.`;
  }

  req.session.counter = smsCount + 1;
  req.session.respvalues = respValues;

  if(req.body.Body.toLowerCase() == `clear`) {
    req.session.respvalues = [];
    req.session.counter = 0;
    message = "You have cleared your information"
  }

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log('Example app listening on port 8000!')
});