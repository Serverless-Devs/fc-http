# fc-http
<p align="center" class="flex justify-center">
  <a href="https://nodejs.org/en/" class="ml-1">
    <img src="https://img.shields.io/badge/node-%3E%3D%2010.8.0-brightgreen" alt="node.js version">
  </a>
  <a href="https://github.com/devsapp/website-fc/blob/master/LICENSE" class="ml-1">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="license">
  </a>
</p>

此模块可以方便的将传统的 web 框架使用 [Nodejs runtime](https://help.aliyun.com/document_detail/58011.html) 的形式运行在阿里云函数计算。

- [快速开始](#快速开始)
  - [为什么要使用原生运行环境](#为什么要使用原生运行环境)
  - [框架支持](#框架支持)
  - [快速体验](#快速体验)
    - [基本示例](#基本示例)
    - [高级选项](#高级选项)
  - [示例代码](https://github.com/devsapp/start-web-framework/tree/master/web-framework/nodejs/nodejs-runtime)
- [关于我们](#关于我们)

## 快速开始
### 为什么要使用原生运行环境
将nodejs应用部署在函数计算FC上，一般有下面几种方式
- [原生Nodejs运行环境](https://help.aliyun.com/document_detail/58011.html)
- [Custom Runtime](https://help.aliyun.com/document_detail/132044.html)
- [Custom Container](https://help.aliyun.com/document_detail/179368.html)

#### Nodejs Runtime
Nodejs运行环境（简称`Nodejs Runtime`）支持Nodejs6到Nodejs14的版本，用于只需要提供入口函数如下：
```
function(request, response, context) {}
```
当有请求触发的时候，函数计算平台会调用这个方法，启动您的应用进行处理，参考[示例](https://github.com/devsapp/start-fc/tree/master/http-function/fc-http-node.js14/src)

#### Custom Runtime
`Custom Runtime`是自定义运行环境，您可以自定义应用的启动脚本`bootstrap`进行启动web服务器。很方便的将您的应用快速迁移到函数计算平台，参考[示例](https://github.com/devsapp/start-web-framework/blob/master/web-framework/nodejs/express/src/code/bootstrap)

#### Custom Container
使用`Custom Container`方式，开发者需要提前准备好镜像。这样能够实现最大的灵活性。

> 从灵活性来看 `Custom Container` > `Custom Runtime` > `Nodejs Runtime`

> 从性能来看 `Nodejs Runtime` > `Custom Runtime` > `Custom Container`

而且 `Nodejs Runtime`还有以下优点：
- 版本支持到`nodejs14`, `Custom Runtime`默认环境是`nodejs10`,否则需要将nodejs的二进制包，上传到当前的运行环境
- 日志输出友好，相比`Custom Runtime`在`高级查询`更具有可读性
- 支持[layer](https://help.aliyun.com/document_detail/193057.html)层，提取公共依赖。


## 框架支持
FC-http目前已经支持主流Nodejs框架快速接入，并提供模版示例。通过执行指令 如：`s init express-app`快速体验。

- Express: `s init express-app`
- Koa: `s init koa-app`
- Hapi: `s init hapi-app`
- Egg: `s init egg-app`
- nest: `s init nest-app`
- nuxt: `s init nuxt-app`
- thinkjs: `s init thinkjs-app`
- Connect: `s init connect-app`
- Sails
- Fastify
- Restify
- Polka
- Loopback


## 快速体验
```
$ npm i @serverless-devs/fc-http
```
### 基本示例
- 基本示例
```
const serverless = require('@serverless-devs/fc-http');
const express = require('express')
const app = express()

app.get('/user', (req, res) => {
  res.send('hello user!')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

exports.handler = serverless(app)
```
更多例子见 `examples`

## 高级选项

fc-http 接受第二个参数options，它可以配置：

### 基本路径
- basePath：无服务器应用程序的基本路径/挂载点。如果您希望使用多个 Lambda 来表示应用程序的不同部分，则很有用。

- 配置前
```
app.get("/new", (ctx) => {
  res.send('Hello World!')
})

exports.handler = serverless(app);
```
```
[GET] http://localhost/api/new -> 404
```

- 配置后

```
app.get("/new", (ctx) => {
  res.send('Hello World!')
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
exports.handler = serverless(app, {
  request: {
    key: 'value'
  },
  response(res) {
    res.foo = 'bar';
  }
})

exports.handler = serverless(app, {
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

# 关于我们
- Serverless Devs 工具：
    - 仓库：[https://www.github.com/serverless-devs/serverless-devs](https://www.github.com/serverless-devs/serverless-devs)    
      > 欢迎帮我们增加一个 :star2: 
    - 官网：[https://www.serverless-devs.com/](https://www.serverless-devs.com/)
- 阿里云函数计算组件：
    - 仓库：[https://github.com/devsapp/fc](https://github.com/devsapp/fc)
    - 帮助文档：[https://www.serverless-devs.com/fc/readme](https://www.serverless-devs.com/fc/readme)
- 钉钉交流群：33947367    
