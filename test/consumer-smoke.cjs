'use strict';

var assert = require('assert');
var path = require('path');
var packageRoot = process.argv[2] || '.';
var emj = require(path.resolve(packageRoot));
var value = JSON.stringify({
  name: 'Emojion',
  created: 2019,
  isAbsurd: true,
  values: ['🙌', 2, false, null],
});

assert.strictEqual(emj.parse(emj.generate(value)), value);
