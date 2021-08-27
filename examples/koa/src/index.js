const serverless = require('@serverless-devs/fc-http');
const Koa = require('koa');
var Router = require("koa-router");
var router = new Router()

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
