var 
	_ = require('underscore'),
	fs = require('fs'),
	path = require('path-extra'),
	util = require('util'),
	exec = require("child_process").exec,
	glob = require('glob'),
	chalk = require('chalk'),

	pkg = require('../package.json'),
	Schema = require('./model').Schema,

	Promise = require('bluebird'),
	readFile = Promise.promisify(require("fs").readFile)
	;

var readers = {
	'.php': function(fn) {
		var type = 'dictionary';
		var dfrd = new Promise(function(resolve, reject) {
			exec(util.format("php bin/php2json.php '%s' %s", fn, type), function(
					error, stdout, stderr)
			{
				if (error) {
					reject(error);
				} else {
					var data = {};
					data[type] = JSON.parse(stdout);
					resolve(data);
				}
			});
		});
		return dfrd;
	},
};

var commands = {
	'scan': function(argv, config) {
		exportObject.scanDir('.').then(function(results) {
			console.log(util.format("OK, %i results.", results.length));
		});
	},
	'show-file': function(argv, config) {
		exportObject.showFile(argv['show-file']).then(function(data) {
			console.log(data);
		});
	},
	'list-schema': function(argv, config) {
		exportObject.listSchema();
	},
};

var exportObject = {
	findConfig: function() {
		var sysFile = 'invidia/config.js',
			usrFile = '.'+sysFile,
			files = [ sysFile, usrFile ],
			cwd = process.cwd(),
			homedir = path.homedir(),
			etc = '/etc',
			paths = [ cwd, homedir, etc ];
		
		return new Promise(function(resolve, reject) {
			var files = [];
			_.each(paths, function(dirpath) {
				_.each(files, function(supportFile) {
					var fn = path.join(dirpath, supportFile);
					if (fs.existsSync( fn )) {
						files.push(fn);
					}
				});
			});
			if (files.length) {
				resolve(files);
			} else {
				reject("No config files found");
			}
		});
	},
	initConfig: function() {
		return new Promise(function(resolve) {
			exportObject.findConfig().then(function (configs) {
				console.log(['config', arguments]);
			}, function(err) {
				console.error(err);
				//process.exit(1);
				// default config
				resolve({
					newConfig: true
				});
			});
		});
	},

	/**
	 * Returns a list of promises, one for each found metafile.
	 */
	scanDir: function(dirpath) {
		return new Promise(function(resolve, reject) {
			if (!fs.existsSync(dirpath)) {
				throw {msg: "No such directory: "+dirpath};
			}
			glob('**/*vardefs.php', function(err, matches) {
				var tasks = [], results = [];
				_.each(matches, function(metafile) {
					tasks.push(function() {
						exportObject.processFile(metafile).then(function() {
							
						});
					});
				});
				Promise.all(tasks).then( function() {
					resolve(results);
				});
			});
		});
	},
	listSchema: function() {
		new Schema().fetch().then(function(models) {
			console.log(models);
		});
	},
	processFile: function(fn) {
		return new Promise(function(resolve, reject) {
			exportObject.showFile(fn).then(function(data) {
				console.log([data['dictionary']['Account'], fn]);
				resolve(data);
			});
		});
	},
	showFile: function(fn) {
		return new Promise(function(resolve, reject) {
			exportObject.readFile(fn).then(function(data) {
				resolve(data);
			});
		});
	},
	readFile: function(fn) {
		return readers[path.extname(fn)](fn);
	},
	runMain: function(config) {
		return new Promise(function(resolve, reject) {
			var argv = require('minimist')(process.argv.slice(2));
			console.log(argv);
			config.then(function(config) {
				var cmds = _.filter(commands, function(handler, cmdid) {
					return typeof argv[cmdid] != 'undefined';
				});
				if (cmds.length) {
					_.each(cmds, function(handler) {
						handler(argv, config);
					});
					resolve("Done");
				} else {
					resolve( function() {
						console.log('Nothing to do');
					});
				}
			});
		}).then(function(handler) {
			console.log(chalk.blue("Done"));
		});
	}
};

module.exports = _.extend({
		version: pkg.version
	}, exportObject);
