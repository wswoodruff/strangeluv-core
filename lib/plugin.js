'use strict';

const Url = require('url');
const Util = require('util');
const Inert = require('inert');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const Package = require('../package.json');

const internals = {};

module.exports = {
    register: async (server, options) => {

        const dev = !!options.compiler;

        server.path(dev ? options.static : options.dist);

        await server.register(Inert);

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
        server.ext({
            type: 'onRequest',
            method: (request, h) => {

                const route = request.server.match(request.method, request.path);
                const noOtherRoute = !route || route.settings.id === 'strangeluv-core-catchall';
                const isGet = request.method === 'get';
                const takesHtml = internals.takesHtml(request.headers.accept);
                const looksLikeFile = request.path.indexOf('.') !== -1;

                if (noOtherRoute && !looksLikeFile && isGet && takesHtml) {
                    request.setUrl('/');
                    request.raw.req.url = Url.format(request.url);
                }

                return h.continue;
            }
        });

        if (!dev) {
            // Skip dev/hot middleware
            return;
        }

        // Create middlewares
        const devMiddleware = Util.promisify(WebpackDevMiddleware(options.compiler, options.assets));
        const hotMiddleware = Util.promisify(WebpackHotMiddleware(options.compiler, options.hot));

        // Run dev middleware
        server.ext('onRequest', async (request, h) => {

            const raw = request.raw;
            await devMiddleware(raw.req, raw.res);
            return h.continue;
        });

        // Run hot middleware
        server.ext('onRequest', async (request, h) => {

            const raw = request.raw;
            await hotMiddleware(raw.req, raw.res);
            return h.continue;
        });
    },
    name: Package.name
};


internals.takesHtml = (accept) => {

    if (!accept) {
        return false;
    }

    return accept.indexOf('text/html') !== -1 || accept.indexOf('*/*') !== -1;
};
