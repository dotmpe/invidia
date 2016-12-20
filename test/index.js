require('should');
var pkg = require('../package.json');
var lib = require('../lib');

describe('invidia', function() {
	it('must have correct package metadata', function() {
		pkg.version.should.equal(lib.version);
//		lib.version.should.equal(pkg.version);
	});
});
