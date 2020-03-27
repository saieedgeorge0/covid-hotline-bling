const express = require('express')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.get('/', (req, res) => {
  res.send('Hi Ellen part 2')
});

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('The Robots are coming! Head for the hills!');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(port, () => {
  console.log('Example app listening on port 8000!')
});