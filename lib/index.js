/**
 * Main library file with invidia core schema location and parsing.
 */
var 
	_ = require('underscore'),
	fs = require('fs'),
	path = require('path-extra'),
	util = require('util'),
	glob = require('glob'),
	chalk = require('chalk'),
	Promise = require('bluebird'),

	pkg = require('../package.json'),
	Schema = require('./model').Schema,
	Context = require('./context').Context
	;

/* Command-line argument handlers 
 */
var commands = {
	'scan': function(ctx) {
		console.log(ctx.cmdid);
		console.log(ctx.argv);
		var subCtx = ctx.createSub({ dirpath: 
			fs.existsSync(ctx.argv.dir) ? ctx.argv.dir : 'sugarcrm'
		});
		core.compileScans(subCtx)
			.then( function(results) {
				console.log(util.format("%s, %s results.", chalk.green("OK"), 
					chalk.bold(results.length)));
		});
	},
	'show-file': function(argv, config) {
		core.showFile(argv['show-file']).then(function(data) {
			console.log(data);
		});
	},
	'list-schema': function(argv, config) {
		core.listSchema();
	},
};

/* Grouped metadata scan functions.
 */
var scans = {
};

/* Parsers for filetypes.
 */
var readers = {
};

var extensionPoints = {
	commands: commands,
	scans: scans,
	readers: readers
};

var core = {

	/**
	 * Promise a list of config files.
	 */
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
				reject(chalk.yellow("No config files found"));
			}
		});
	},
	/**
	 * Load existing config(s) or bootstrap fresh config.
	 */
	initConfig: function() {
		return new Promise(function(resolve) {
			core.findConfig().then(function (configs) {
				console.log(['config', arguments]);
			}, function(err) {
				console.error(err);
				console.log(chalk.grey("Using default config"));
				//process.exit(1);
				// default config
				resolve({
					newConfig: true
				});
			});
		});
	},

	compileScans: function(ctx) {
		return new Promise(function(resolve, reject) {
			var scans = [];
			_.each( extensionPoints.scans, function(group, groupName) {
				var globPattern = groupName.replace(/%\(([a-zA-Z]*)\)[sdj]/, '*');
				scans.push( path.join(ctx.basedir, globPattern) );
			});
			resolve(scans);
		});
	},

	/* Run processFile on each metadata file */
	runScans: function(scans) {
		return new Promise(function(resolve, reject) {
			// XXX old: glob('**/*vardefs.php', function(err, matches) {
			_.each(scans, function( pattern ) {
				console.log(util.format("Scanning for %s", pattern));
				glob( pattern, function(err, matches) {
					/* Turn each match into a core.processFile promise */
					var tasks = _.map(matches, function(metafile) {
						return core.processFile(metafile)
						.then(function(models) {
							console.log('TODO runScans processFile ready');
							console.log(models);
						});
					});
					/* Resolve after all processFile promises are done */
					Promise.all(tasks).then( function() {
						resolve();
					});
				});
			});
		});
	},
	/**
	 * Print list and return promise for Schema instances.
	 */
	listSchema: function() {
		return new Schema().fetch().then(function(models) {
			console.log(models);
		});
	},
	/**
	 * Promise to load and process a file to a set of model instances.
	 */
	processFile: function(fn) {
		return new Promise(function(resolve, reject) {
			core.readFile(fn).then(function(data, handler) {
				//console.log([data['dictionary']['Account'], fn]);
				var models = [];
				resolve(models);
			});
		});
	},

	/* Invoke a reader given a filename, promise parsed results.
	 * These readers are loaded though extensions.
	 */
	readFile: function(fn) {
		return readers[path.extname(fn)](fn);
	},

	/**
	 * Load extension points from module.
	 *
	 * Very crude, just manipulates globals in place.
	 * Perhaps later write proper lookup methods for extensions.
	 */
	loadExtension: function(module) {
		return new Promise(function(resolve, reject) {
			_.each(['commands', 'readers', 'scans'], function(propname) {
				if (module[propname]) {
					extensionPoints[propname] = _.extend(
						extensionPoints[propname], module[propname]);
				}
			});
			resolve();
		});
	},
	loadExtensions: function(dirname) {
		return new Promise(function(resolve, reject) {
			var pattern = path.join('lib', dirname, '*.js'),
				modules = [];
			if (!fs.existsSync(path.join('lib', dirname))) {
				throw util.format("No such directory: %s", dirpath);
			}
			glob(pattern, function(err, matches) {
				_.each(matches, function(extpath) {
					extfile = './'+path.join(dirname, 
						path.basename(extpath, path.extname(extpath)));
					var module = require(extfile);
					core.loadExtension(module).then(function(ext) {
						modules.push(ext);
					});
				});
				resolve(modules);
			});
		});
	},

	/**
	 * Main entrypoint, requires config and extensions promises.
	 * Each argument corresponding to an ID in the commands dictionary is
	 * run in sequence.
	 */
	runMain: function(config, extensions) {
		return new Promise(function(resolve, reject) {
			Promise.all(
				extensions, config
			).then(function() {
				var argv = require('minimist')(process.argv.slice(2));
				var ctx = new Context({ 
					argv: argv, 
					config: config, 
					extensions: extensions 
				});
				var cmds = _.filter(_.pairs(commands), function(pair, index, list) {
					var cmdid = pair[0];
					return typeof argv[cmdid] != 'undefined';
				});
				if (cmds.length) {
					_.each(cmds, function(pair, index, list) {
						var cmdid = pair[0], handler = pair[1];
						// TODO: record results
						console.log(ctx.argv);
						handler(ctx.createSub({ cmdid: cmdid }));
					});
					resolve("Done");
				} else {
					resolve( function() {
						console.log('Nothing to do');
					});
				}
			}, reject);
		}).then(function(handler) {
			console.log(chalk.grey("[main]") +' '+ chalk.blue("Done"));
		});
	}
};

/* share with the CommonJS/NodeJS world */
module.exports = _.extend({
		version: pkg.version,
		base: extensionPoints
	}, core);
