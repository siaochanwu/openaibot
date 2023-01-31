require('dotenv').config();
const axios = require('axios');
const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require("openai");
const {CHANNEL_ACCESS_TOKEN, OPENAI_KEY, USER_ID} = process.env;


router.post('/line', async (req, res, next) => {
  const client = new line.Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
  });

  if (!req.body.events[0]) {
    res.status(200).send('connect');
    return
  }

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
        max_tokens: 2048,
        temperature: 0,
      });
      console.log(response.data.choices[0].text);
      const data = {
        type: 'text',
        text: response.data.choices[0].text
      };
      //line reply
      client.pushMessage(USER_ID, data)
      .then(() => {
        console.log('success')
      })
      .catch((err) => {
          throw err
      });
    } catch (error) {
      console.log(error);
      throw error
    }
  }
})
module.exports = router;
