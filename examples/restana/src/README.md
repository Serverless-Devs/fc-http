# fc-http

## 快速体验
```
const serverless = require('@serverless-devs/fc-http');
const app = require('restana')()

app.get('/restance', (req, res) => {
  res.send('Hello Restance!')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

exports.handler = serverless(app);

```

## 部署
```
$ cd examples/restana
$ cd src && npm install && 
$ cd ..
$ s deploy
```