# fc-http

## 快速体验
```
const serverless = require('@serverless-devs/fc-http');
const connect = require('connect')
const app = connect();

app.use((req, res, next) => {
  res.end('Hello World');
});

exports.handler = serverless(app);

```

## 部署
```
$ cd examples/connect
$ cd src && npm install && 
$ cd ..
$ s deploy
```