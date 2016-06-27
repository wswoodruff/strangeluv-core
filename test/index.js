'use strict';

// Load modules

const Lab = require('lab');
const Code = require('code');
const Strangeluv = require('..');

// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

const internals = {};

describe('strangeluv-core', () => {

    describe('Wires class', () => {

        const reducers = {
            './reducers/PascalName.js': 'pascalName',
            './reducers/dash-name.js': 'dashName',
            './reducers/under_name.js': 'underName',
            './not-reducers/some-name.js': 'bad'
        };

        const ctx = (reducer) => reducers[reducer];
        ctx.keys = () => Object.keys(reducers);

        it('builds reducers config given webpack context, ignoring non-reducers.', (done) => {

            const wires = new Strangeluv(ctx);

            expect(wires.reducers()).to.equal({
                pascalName: 'pascalName',
                dashName: 'dashName',
                underName: 'underName'
            });

            done();
        });

        it('exposes context and normalized filenames.', (done) => {

            const wires = new Strangeluv(ctx);

            expect(wires.ctx).to.shallow.equal(ctx);
            expect(wires.files).to.have.length(4);
            expect(wires.files).to.only.contain([
                'reducers/PascalName',
                'reducers/dash-name',
                'reducers/under_name',
                'not-reducers/some-name'
            ]);

            done();
        });

        it('throws when not provided a context.', (done) => {

            expect(() => {

                new Strangeluv();
            }).to.throw('Context not provided to the wires.');

            done();
        });

        it('memoizes reducers until flushed with flushReducers().', (done) => {

            const wires = new Strangeluv(ctx);

            const first = wires.reducers();
            const second = wires.reducers();
            wires.flushReducers();
            const flushed = wires.reducers();

            expect(first).to.shallow.equal(second);
            expect(second).to.not.shallow.equal(flushed);
            expect(second).to.equal(flushed);

            done();
        });

        it('get() requires file from its normalized name.', (done) => {

            const wires = new Strangeluv(ctx);

            expect(wires.get('reducers/PascalName')).to.equal('pascalName');

            done();
        });
    });
});
