# fc-http

## 快速体验
```
const serverless = require('@serverless-devs/fc-http');
const { Nuxt } = require('nuxt-start')
const config = require('./nuxt.config.js')

const nuxt = new Nuxt({ ...config, dev: false, _start: true, telemetry: false })

exports.handler = async (res, req, context) => {
  await nuxt.ready()
  serverless(nuxt.server.app)(res, req, context)
};

```

## 部署
```
$ cd examples/nuxt
$ cd src && npm install && 
$ cd ..
$ s deploy
```



## 自定义 nuxt 内容

- 初始化 nuxt 项目
```
npm init nuxt-app <project-name>
```

- 替换 `.nuxt` 文件夹
- 修改 `nuxt.config.js` 文件内容

- s deploy 部署


