'use strict';

var
	config = require('../.invidia/config.js'),
	knex = require('knex')(config.knex_test),
	bookshelf = require('bookshelf')(knex),
	invidia_model = require('../lib/model.js')
;

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

exports['model'] = {
	setUp: function( done ) {
		done();
	},
	'js-obj': function( test ) {
		test.done();
	}
};

