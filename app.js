const express = require('express')
const session = require('express-session');
const { urlencoded } = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();
app.use(urlencoded({ extended: false}));
app.use(session({secret: 'anything-you-want-but-keep-secret'}));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.get('/', (req, res) => {
  res.send('COVID Hotline Bling Bot is running')
});

app.post('/sms', (req, res) => {
  const smsCount = req.session.counter || 0;
  const respValues = req.session.respvalues || [];

  let message = `What state do you currently live in?`;

  if(smsCount == 1) {
    respValues.push(req.body.Body);
    message = `Which county within ${respValues[0]} do you currently reside?`;
  }

  if(smsCount > 1) {
    respValues.push(req.body.Body);
    message = `Thanks! You live in ${respValues[1]}, ${respValues[0]}.`;
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