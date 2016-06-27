# strangeluv-core

Core wiring and hapi plugin for the strangeluv React boilerplate

## API
### `Strangeluv.plugin`
A hapi plugin providing Webpack HMR and development functionality alongside serving static files.  Fully-pluginized and prepared for multi-plugin deployments.  Takes options,
- `compiler` - when passed a Webpack compiler, HMR and development functionality will be enabled (see `assets`, `hot`, and `static` options) using this compiler.
- `assets` - options for [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) (applicable when `compiler` is specified).
- `hot` - options for [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) (applicable when `compiler` is specified).
- `static` - absolute path to static assets to serve (applicable when `compiler` is specified).
- `dist` - absolute path to static app distribution to serve (applicable when `compiler` is not specified).

### `new Strangeluv.Wires(ctx)`
An instance of wires for a strangeluv application.  Currently provides wiring for reducers based-upon directory structure.  Receives a Webpack context of all `.js` files based at the app root.

#### `wires.ctx`
The Webpack context passed during construction.

#### `wires.files`
Normalized filenames for this Webpack context (no `./` or `.js`).

#### `wires.reducers()`
Returns reducer config from all reducers in `./reducers` relative to the Webpack context.  Returns an object whose keys are camelized filenames and whose values are the associated reducers.

#### `wires.flushReducers()`
Breaks the memoization/cache used with `wires.reducers()`.  Used with hot-reloading of reducers.

#### `wires.get(file)`
Returns a `require()`d file given normalized filename (from `wires.files`).
