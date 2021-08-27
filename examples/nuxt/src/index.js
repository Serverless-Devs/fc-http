const serverless = require('@serverless-devs/fc-http');
const { Nuxt } = require('nuxt-start')
const config = require('./nuxt.config.js')

const nuxt = new Nuxt({ ...config, dev: false, _start: true, telemetry: false })

exports.handler = async (res, req, context) => {
  await nuxt.ready()
  serverless(nuxt.server.app)(res, req, context)
};
