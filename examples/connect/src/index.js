const serverless = require('@serverless-devs/fc-http');
const connect = require('connect')
const app = connect();

app.use((req, res, next) => {
  res.end('Hello World');
});

exports.handler = serverless(app);
