const fastify = require('fastify');
const fcookie = require('fastify-cookie');
const fblipp = require('fastify-blipp');
const fstatic = require('fastify-static');
const pov = require('point-of-view');
const path = require('path');
const nunjucks = require('nunjucks');
const fmulter = require('fastify-multer');
const { session, store } = require('./session-store');
const fastifyRequestLogger = require('@mgcrea/fastify-request-logger');
const prettifier = require('@mgcrea/pino-pretty-compact');
const db_plugin = require("./plugs/db");
const Flash = require('./flash');

module.exports.createApp = function createApp(options) {
  const app = fastify({
    pluginTimeout: 3000,
    logger: {
      prettyPrint: true,
      prettifier
    }
  });

  app
    .register(fcookie)
    .register(session, {
      secret: 'djksjdksdkjsrereuoroedjosjdosjdosjdsdsdsd',
      cookie: {
        secure: false
      },
      store
    })
    .register(Flash)
    .register(fblipp)
    .register(fstatic, {
      root: path.join(__dirname, "static"),
      prefix: "/static"
    })
    .register(pov, {
      engine: {
        nunjucks
      },
      root: path.join(__dirname, 'views'),
      viewExt: 'html',
    })
    .register(fmulter.contentParser)
    .register(db_plugin)
    .register(require("./routes"));

  return app;
}