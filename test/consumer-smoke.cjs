'use strict';

var assert = require('assert');
var path = require('path');
var packageRoot = process.argv[2] || '.';
var emj = require(path.resolve(packageRoot));
var value = {
  name: 'Emojion',
  created: 2019,
  isAbsurd: true,
  values: ['🙌', 2, -1.5e-7, false, null, [], {}],
};

assert.deepStrictEqual(emj.parse(emj.stringify(value)), value);
assert.strictEqual(
  JSON.stringify(emj.parse(emj.stringify(value))),
  JSON.stringify(value)
);

// JSON.stringify() rules
var date = new Date(0);
assert.deepStrictEqual(
  emj.parse(emj.stringify({ date: date, skip: undefined, list: [undefined] })),
  { date: date.toJSON(), list: [null] }
);

// A __proto__ key is an own property, not the prototype.
var proto = emj.parse(emj.stringify(JSON.parse('{"__proto__":{"a":1}}')));
assert.strictEqual(Object.getPrototypeOf(proto), Object.prototype);
assert.deepStrictEqual(Object.keys(proto), ['__proto__']);

assert.throws(function () {
  emj.parse('🙌💩✋');
}, SyntaxError);

var circular = {};
circular.self = circular;
assert.throws(function () {
  emj.stringify(circular);
}, TypeError);
assert.throws(function () {
  emj.stringify(undefined);
}, TypeError);
assert.strictEqual(typeof emj.generate, 'undefined');
