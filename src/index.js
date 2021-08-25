const URL = require('url');
const serverless = require('serverless-http');
const makeResolver = (ctx) => {
  return data => {
    const response = ctx.response;
    response.setStatusCode(data.statusCode);
    for (const key in data.headers) {
      if (data.headers.hasOwnProperty(key)) {
        const value = data.headers[key];
        response.setHeader(key, value);
      }
    }
    response.send(data.body);
  };
}

const CONTEXT_HEADER_NAME = 'x-fc-express-context';

const getRequestHeaders = (ctx) => {
  const request = ctx.request;
  const headers = Object.assign({}, request.headers);
  return headers;
}
const getSocketPath = () => {
  const socketPathSuffix = Math.random().toString(36).substring(2, 15);
  /* istanbul ignore if */ /* only running tests on Linux; Window support is for local dev only */
  if (/^win/.test(process.platform)) {
    const path = require('path');
    return path.join('\\\\?\\pipe', process.cwd(), `server-${socketPathSuffix}`);
  } else {
    return `/tmp/server-${socketPathSuffix}.sock`;
  }
}

const mapContextToHttpRequest = (ctx) => {
  const headers = getRequestHeaders(ctx);
  const request = ctx.request;
  headers[CONTEXT_HEADER_NAME] = encodeURIComponent(JSON.stringify(ctx.context));
  return {
    method: request.method,
    path: URL.format({ pathname: request.path, query: request.queries }),
    url: request.url,
    headers,
    socketPath: getSocketPath(),
    // protocol: `${headers['x-forwarded-proto']}:`,
    // host: headers.host,
    // hostname: headers.Host, // Alias for host
    // port: headers['X-Forwarded-Port']
  };
}

const formatCtx = (first, second, thrid) => {
  return {
    request: first, response: second, context: thrid
  }
}

const getContentType = (params) => {
  return params.contentTypeHeader ? params.contentTypeHeader.split(';')[0] : '';
}

const forwardResponse = (response, resolver) => {
  const statusCode = response.statusCode;
  const headers = response.headers;
  const contentType = getContentType({ contentTypeHeader: headers['content-type'] });
  const successResponse = { statusCode, body: response.body, headers, contentType };
  resolver(successResponse);
}

module.exports = (app, opts) => {
  return async (first, second, thrid) => {
    const ctx = formatCtx(first, second, thrid);
    const resolver = makeResolver(ctx);
    const event = mapContextToHttpRequest(ctx);
    const serverlessHandler = serverless(app, opts);
    const data = await serverlessHandler(event, second);
    forwardResponse(data, resolver)
  }
}
