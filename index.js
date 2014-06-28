var libPath = process.env['COVERAGE'] ? './lib-cov' : './lib';

module.exports = require(libPath + '/index');
