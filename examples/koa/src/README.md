# fc-http

## 快速体验
```
const serverless = require('@serverless-devs/fc-http');
const Koa = require('koa');
const Router = require("koa-router");
const router = new Router()
const app = new Koa();

router
  .get("/koa", (ctx) => {
    ctx.body = 'Hello Koa!';
  })
  .get("/", async (ctx) => {
    ctx.body = "Hello World!";
  })
app.use(router.routes());

exports.handler = serverless(app);

```

## 部署
```
$ cd examples/koa
$ cd src && npm install && 
$ cd ..
$ s deploy
```