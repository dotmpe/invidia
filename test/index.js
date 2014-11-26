require('should');
var pkg = require('../package.json');
var index = require('../');
var lib = require('../lib-cov');

describe('invidia', function() {
	it('must have correct package metadata', function() {
		pkg.version.should.equal(lib.version);
//		lib.version.should.equal(pkg.version);
	});
});
