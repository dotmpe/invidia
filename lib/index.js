var _ = require('underscore'),
	fs = require('fs')
	interpret = require('interpret')

	pkg = require('../package.json'),
	Schema = require('./model').Schema

	;

//console.log(interpret);
require.extensions['php'] = function() {
	console.log(arguments);
};

var utils = {
	scanDir: function(dirpath) {
		if (!fs.existsSync(dirpath)) {
			throw {msg: "No such directory: "+dirpath};
		}
	},
	listSchema: function() {
		new Schema().fetch().then(function(models) {
			console.log(models);
		});
	},
	showFile: function(fn) {
		var data = require(fn);
		console.log([data, fn]);
	}
};

module.exports = _.extend({
		version: pkg.version
	}, utils);
