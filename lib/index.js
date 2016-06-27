'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var internals = {};

module.exports = function () {
    function _class(ctx) {
        _classCallCheck(this, _class);

        if (!ctx) {
            throw new Error('Context not provided to the wires.');
        }

        // Webpack context of the app.  Should only be .js files.
        this.ctx = ctx;
        this.files = ctx.keys().map(function (file) {
            // Remove ./ and .js
            return file.slice(2, -3);
        });
    }

    // List reducers from reducers/ for use in Redux.combineReducers()


    _createClass(_class, [{
        key: 'reducers',
        value: function reducers() {
            var _this = this;

            if (this._reducersMemo) {
                return this._reducersMemo;
            }

            var syncReducers = this.files.reduce(function (collector, file) {

                var match = file.match(internals.regex.reducers);

                if (!match) {
                    return collector;
                }

                var name = internals.camelize(match[1]);
                collector[name] = _this.get(file);

                return collector;
            }, {});

            this._reducersMemo = syncReducers;
            return syncReducers;
        }
    }, {
        key: 'flushReducers',
        value: function flushReducers() {

            this._reducersMemo = null;
        }
    }, {
        key: 'get',
        value: function get(file) {

            return this.ctx('./' + file + '.js');
        }
    }]);

    return _class;
}();

internals.regex = {
    routes: /(?:routes\/[^\/]+)+/g,
    reducers: /^reducers\/([^\/]+)$/
};

internals.camelize = function (name) {

    // Max-fluxlr -> max-fluxlr
    name = name[0].toLowerCase() + name.slice(1);

    // max-fluxlr -> maxFluxlr
    name = name.replace(/[_-]./g, function (m) {
        return m[1].toUpperCase();
    });

    return name;
};