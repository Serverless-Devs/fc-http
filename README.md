# fc-http

## 快速体验
### Koa
- Koa 基本示例
```
const serverless = require('fc-http');
const Koa = require('koa'); // or any supported framework

const app = new Koa();

app.use(/* register your middleware as normal */);

module.exports.handler = serverless(app);

```
- Koa 路由示例
```
const serverless = require('fc-http');
const Koa = require('koa');
const Router = require("koa-router");
const router = new Router()
const app = new Koa();

router
  .get("/aaa", async (ctx) => {
    ctx.body = "aaaa";
  })
  .get("/bbb", async (ctx) => {
    ctx.body = "bbbb";
  })
  .get("/", async (ctx) => {
    ctx.body = "首页";
  })
app.use(router.routes())

exports.handler = serverless(app);

```

## 高级选项 Options

fc-http 接受第二个参数options，它可以配置：

### 基本路径
- basePath：无服务器应用程序的基本路径/挂载点。如果您希望使用多个 Lambda 来表示应用程序的不同部分，则很有用。
前

- 配置前
```
router.get('/new', (req, res) => {
  return res.send('hello world');
});

exports.handler = serverless(app);
```
```
[GET] http://localhost/api/new -> 404
```

- 配置后

```
router.get('/new', (req, res) => {
  return res.send('hello world');
});

exports.handler = serverless(app, {
  basePath: '/api'
});
```
```
[GET] http://localhost/api/new -> 200
```
在 FC 中，上面的示例也适用于：
```
https://xxx.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/dk-http-demo/api/new -> 200
```