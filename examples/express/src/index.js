const serverless = require('@serverless-devs/fc-http');
const express = require('express')
const app = express()

app.get('/express', (req, res) => {
  res.send('Hello Express!')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

exports.handler = serverless(app);
