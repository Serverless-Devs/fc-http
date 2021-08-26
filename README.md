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
  .get("/aaa", (ctx) => {
    ctx.body = "aaaa";
  })
  .get("/bbb", (ctx) => {
    ctx.body = "bbbb";
  })
  .get("/", (ctx) => {
    ctx.body = "首页";
  })
app.use(router.routes())

exports.handler = serverless(app);

```

## 高级选项 Options

fc-http 接受第二个参数options，它可以配置：

### 基本路径
- basePath：无服务器应用程序的基本路径/挂载点。如果您希望使用多个 Lambda 来表示应用程序的不同部分，则很有用。

- 配置前
```
router.get("/new", (ctx) => {
    ctx.body = "hello world";
})

exports.handler = serverless(app);
```
```
[GET] http://localhost/api/new -> 404
```

- 配置后

```
router.get("/new", (ctx) => {
    ctx.body = "hello world";
})

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

### 转换
- request：请求的转换，在它被发送到应用程序之前
- response：响应的转换，在返回给 Lambda 之前

转换是要分配的函数（req|res、事件、上下文）或对象。

您可以在请求通过您的应用程序之前对其进行转换。

您可以在响应返回之后，在发送之前对其进行转换：

一些例子
```
module.exports.handler = serverless(app, {
  request: {
    key: 'value'
  },
  response(res) {
    res.foo = 'bar';
  }
})

module.exports.handler = serverless(app, {
  request(request, event, context) {
    request.context = event.requestContext;
  },
  async response(response, event, context) {
    // the return value is always ignored
    return new Promise(resolve => {
      // override a property of the response, this will affect the response
      response.statusCode = 420;

      // delay your responses by 300ms!
      setTimeout(() => {
        // this value has no effect on the response
        resolve('banana');
      }, 300);
    });
  }
})
```

### 二进制 Binary Mode

二进制模式检测查看BINARY_CONTENT_TYPES环境变量，或者您可以指定类型数组，或自定义函数：

```
// turn off any attempt to base64 encode responses -- probably Not Going To Work At All
serverless(app, {
  binary: false
});

 // this is the default, look at content-encoding vs. gzip, deflate and content-type against process.env.BINARY_CONTENT_TYPES
serverless(app, {
  binary: true
});

// set the types yourself - just like BINARY_CONTENT_TYPES but using an array you pass in, rather than an environment varaible
serverless(app, {
  binary: ['application/json', 'image/*']
});

// your own custom callback
serverless(app, {
  binary(headers) {
    return ...
  }
});
```