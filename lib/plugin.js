'use strict';

const Url = require('url');
const Inert = require('inert');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const Package = require('../package.json');

const internals = {};

module.exports = (server, options, next) => {

    const dev = !!options.compiler;

    server.path(dev ? options.static : options.dist);

    server.register(Inert, (err) => {

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
        server.ext('onRequest', (request, reply) => {

            const route = request.connection.match(request.method, request.path);
            const noOtherRoute = (route.settings.id === 'strangeluv-core-catchall');
            const isGet = (request.method === 'get');
            const takesHtml = internals.takesHtml(request.headers.accept);
            const looksLikeFile = (request.path.indexOf('.') !== -1);

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
        const devMiddleware = WebpackDevMiddleware(options.compiler, options.assets);
        const hotMiddleware = WebpackHotMiddleware(options.compiler, options.hot);

        // Run dev middleware
        server.ext('onRequest', (request, reply) => {

            const raw = request.raw;

            devMiddleware(raw.req, raw.res, (err) => {

                if (err) {
                    return reply(err);
                }

                reply.continue();
            });
        });

        // Run hot middleware
        server.ext('onRequest', (request, reply) => {

            const raw = request.raw;

            hotMiddleware(raw.req, raw.res, (err) => {

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

internals.takesHtml = (accept) => {

    if (!accept) {
        return false;
    }

    return (accept.indexOf('text/html') !== -1) || (accept.indexOf('*/*') !== -1);
};
