const { Nuxt } = require('nuxt-start')
const config = require('./nuxt.config.js')

const nuxt = new Nuxt({ ...config, dev: false, _start: true, telemetry: false })

module.exports = async (req, res, context) => {
  await nuxt.ready();
  nuxt.server.app(req, res, context);
};