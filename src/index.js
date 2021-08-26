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

const CONTEXT_HEADER_NAME = 'x-fc-http-context';

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
    path: request.path,
    url: request.url,
    headers,
    socketPath: getSocketPath(),
    queryStringParameters: request.queries,
  };
}

const formatCtx = (first, second, thrid) => {
  return {
    request: first, response: second, context: thrid
  }
}

const forwardResponse = (response, resolver) => {
  const { statusCode, headers, body, isBase64Encoded } = response;
  resolver({ statusCode, headers, body, isBase64Encoded });
}

module.exports = (app, opts) => {
  return async (first, second, thrid) => {
    const ctx = formatCtx(first, second, thrid);
    const resolver = makeResolver(ctx);

    // http emit error
    ctx.request.on('error', err => {
      const errorResponse = { statusCode: 502, body: err.message };
      return forwardResponse(errorResponse, resolver);
    });

    const event = mapContextToHttpRequest(ctx);
    const serverlessHandler = serverless(app, opts);
    try {
      const data = await serverlessHandler(event, second)
      forwardResponse(data, resolver)
    } catch (err) { // 异常报错
      const errorResponse = { statusCode: 500, body: e.message }
      forwardResponse(errorResponse, resolver)
    }
  }
}