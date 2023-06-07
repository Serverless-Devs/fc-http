const serverless = require('@serverless-devs/serverless-http');
const getRawBody = require('raw-body');

const makeResolver = (ctx) => {
  return data => {
    const response = ctx.response;
    if (response.setStatusCode) {
      response.setStatusCode(data.statusCode);
    } else {
      response.status = data.statusCode;
      response.statusCode = data.statusCode;
    }
    for (const key in data.headers) {
      if (data.headers.hasOwnProperty(key)) {
        const value = data.headers[key];
        response.setHeader(key, value);
      }
    }
    for (const key in data.multiValueHeaders) {
      const value = data.multiValueHeaders[key]
      response.setHeader(key, value)
    }
    if (response.send) {
      response.send(data.body);
    } else {
      response.end(data.body);
    }
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
const getBody = async (request) =>
  new Promise((resolve, reject) => {
    if (!request.on) {
      resolve('');
    }
    try {
      getRawBody(request).then(resolve, reject);
    } catch (e) {
      reject(e);
    }
  });

const mapContextToHttpRequest = async (ctx) => {
  const headers = getRequestHeaders(ctx);
  const request = ctx.request;
  headers[CONTEXT_HEADER_NAME] = encodeURIComponent(JSON.stringify(ctx.context));
  return {
    method: request.method,
    path: request.path,
    url: request.url,
    headers,
    socketPath: getSocketPath(),
    body: await getBody(ctx.request),
    clientIP: request.clientIP,
    ip: request.ip,
    queryStringParameters: request.queries || request.query, // url 后缀 params 参数
    queries: request.queries || request.query, // url 后缀 params 参数
    // 原始的函数计算请求对象，方便获取其中的一些信息
    fcRequest: request,
    // 针对 FC函数计算 的属性
    fcContext: ctx.context,
    
    httpMethod: request.method,
    // 把context 挂在到req.requestContext上
    requestContext: Object.assign({}, ctx.context, { identity: {sourceIp: request.clientIP} }),
  };
}

const formatCtx = (first, second, thrid) => {
  return {
    request: first, response: second, context: thrid
  }
}

const forwardResponse = (response, resolver) => {
  const { statusCode, headers, body, isBase64Encoded, multiValueHeaders } = response;
  resolver({ statusCode, headers, body, isBase64Encoded, multiValueHeaders });
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

    const event = await mapContextToHttpRequest(ctx);
    const serverlessHandler = serverless(app, opts);
    try {
      const data = await serverlessHandler(event, second)
      forwardResponse(data, resolver)
    } catch (err) { // 异常报错
      const errorResponse = { statusCode: 500, body: err.message }
      forwardResponse(errorResponse, resolver)
    }
  }
}
