'use strict';

var invidia = require('../lib/');
var pkg = require('../package.json');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['invidia'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'invidia-version': function(test) {
		test.expect(1);
		test.equal(invidia.version, pkg.version);
		test.done();
	},
	'invidia-scanDir': function(test) {
		test.expect(1);
		test.throws(function() {
			invidia.scanDir('nosuchdir');
		});
		test.done();
	},
};
