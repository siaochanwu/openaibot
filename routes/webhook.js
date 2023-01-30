require('dotenv').config();
var express = require('express');
var router = express.Router();
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require("openai");
const {CHANNEL_ACCESS_TOKEN, OPENAI_KEY} = process.env;


router.post('/line', async (req, res, next) => {
  const client = new line.Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
  });

  res.status(200).send('connect');

  const configuration = new Configuration({
    apiKey: OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  //get user text
  const event = req.body.events[0];
  const message = event.message;

  if (event.type === 'message' && message.type === 'text') {

    //串接openai
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: message.text.trim(),
        max_tokens: 4000,
        temperature: 0,
      });
      console.log(response.data);
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }

    //line reply
    try {
      await client.replyMessage(event.replyToken, response.data.choices[0].text);
    } catch (err) {
      console.log(err)
      throw err
    }
  }
})
module.exports = router;
