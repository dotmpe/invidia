'use strict';

var invidia = require('../lib/');
var context = require('../lib/context');
var pkg = require('../package.json');

exports['invidia.context'] = {
	setUp: function(done) {
		done();
	},
	'context-1': function(test) {
		test.expect(5);
		var ctx = new context.Context({ x: 1, y: 1});
		test.equal(String(ctx), "Context:/1");
		test.equal(ctx.x, 1);
		var sub = ctx.getSub({ y: 2 });
		test.equal(String(sub), "SubContext:/1/2");
		test.equal(ctx.y, 1);
		test.equal(sub.y, 2);
		test.done();
	},
};

