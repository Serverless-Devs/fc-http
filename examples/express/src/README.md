# fc-http

## 快速体验
```
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

```

## 部署
```
$ cd examples/express
$ cd src && npm install && 
$ cd ..
$ s deploy
```