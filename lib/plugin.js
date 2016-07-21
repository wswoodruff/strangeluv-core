'use strict';

var Url = require('url');
var Inert = require('inert');
var WebpackDevMiddleware = require('webpack-dev-middleware');
var WebpackHotMiddleware = require('webpack-hot-middleware');
var Package = require('../package.json');

var internals = {};

module.exports = function (server, options, next) {

    var dev = !!options.compiler;

    server.path(dev ? options.static : options.dist);

    server.register(Inert, function (err) {

        if (err) {
            return next(err);
        }

        // Serves static or dist
        server.route({
            method: 'get',
            path: '/{p*}',
            config: {
                id: 'strangeluv-core-catchall',
                handler: {
                    directory: { path: '.' }
                }
            }
        });

        // To work with the history API
        server.ext('onRequest', function (request, reply) {

            var route = request.connection.match(request.method, request.path);
            var noOtherRoute = !route || route.settings.id === 'strangeluv-core-catchall';
            var isGet = request.method === 'get';
            var takesHtml = internals.takesHtml(request.headers.accept);
            var looksLikeFile = request.path.indexOf('.') !== -1;

            if (noOtherRoute && !looksLikeFile && isGet && takesHtml) {
                request.setUrl('/');
                request.raw.req.url = Url.format(request.url);
            }

            reply.continue();
        });

        if (!dev) {
            // Skip dev/hot middleware
            return next();
        }

        // Create middlewares
        var devMiddleware = WebpackDevMiddleware(options.compiler, options.assets);
        var hotMiddleware = WebpackHotMiddleware(options.compiler, options.hot);

        // Run dev middleware
        server.ext('onRequest', function (request, reply) {

            var raw = request.raw;

            devMiddleware(raw.req, raw.res, function (err) {

                if (err) {
                    return reply(err);
                }

                reply.continue();
            });
        });

        // Run hot middleware
        server.ext('onRequest', function (request, reply) {

            var raw = request.raw;

            hotMiddleware(raw.req, raw.res, function (err) {

                if (err) {
                    return reply(err);
                }

                reply.continue();
            });
        });

        next();
    });
};

module.exports.attributes = {
    pkg: Package
};

internals.takesHtml = function (accept) {

    if (!accept) {
        return false;
    }

    return accept.indexOf('text/html') !== -1 || accept.indexOf('*/*') !== -1;
};