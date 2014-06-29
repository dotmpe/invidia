/**
 * Main library file with invidia core schema location and parsing.
 */
var 
	_ = require('underscore'),
	fs = require('fs'),
	path = require('path'),
	pathx = require('path-extra'),
	util = require('util'),
	glob = require('glob'),
	chalk = require('chalk'),
	Promise = require('bluebird'),
	//yaml = require("js-yaml"),
	knex = require('knex'),

	pkg = require('../package.json'),
	Schema = require('./model').Schema,
	Context = require('./context').Context
;

/* Command-line argument handlers 
 */
var commands = {
	'scan': function(ctx) {
		core.updateSchema(ctx)
	},
	'show-file': function(cmd) {
		core.showFile(argv['show-file']).then(function(data) {
			console.log(data);
		});
	},
	'list-schema': function(cmd) {
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
	readers: readers,
	readerDefs: {}
};

var core = {

	/**
	 * Return a list of config files.
	 */
	findConfig: function() {
		var sysFile = 'invidia/config.js',
			usrFile = '.'+sysFile,
			files = [ sysFile, usrFile ],
			etc = '/etc',
			cwd = process.cwd(),
			homedir = pathx.homedir(),
			configs = [],
			paths = [cwd],
			isroot = cwd.substr(0,1) == path.sep,
			cpath = cwd.split(path.sep)
		;
		cpath.pop(); // already have cwd,
		// now add everything above but stop at homedir
		for (var i=cpath.length-1;i>=0;i--) {
			var p = cpath.join(path.sep);
			if (isroot && p === '') break;// not looking in root.. p = path.sep;
			if (p == homedir) break;
			paths.push(p);
			cpath.pop();
		}
		console.log(chalk.grey(util.format("Search config in %s", paths)));
		/* Search each path for the support dir/file */
		_.each(paths, function(dirpath, idx) {
			_.each(files, function(supportFile, idx) {
				var fn = path.join(dirpath, supportFile);
				if (fn.substr(0,1) !== path.sep) {
					fn = path.join('.', fn); //relative path for NodeJS require
				}
				if (fs.existsSync( fn )) {
					configs.push(fn);
				}
			});
		});
		if (configs.length) {
			return configs;
		} else {
			console.log(chalk.yellow("No config files found"));
			return []
		}
	},
	/**
	 * Promise to load existing config(s) or bootstrap fresh config.
	 */
	initConfig: function() {
		return new Promise(function(resolveConfig) {
			var configs = core.findConfig();
			if (configs.length) {
				//var config = yaml.load(fs.readFileSync(configs[0])));
				var config = require(configs[0]);
				resolveConfig(config);
			} else {
				console.log(chalk.grey("Using default config"));
				resolveConfig({
					newConfig: true
				});
			}
		});
	},

	updateSchema: function(ctx) {
		/* XXX */
		var schema = fs.existsSync(ctx.argv.scan) 
				? ctx.argv.scan : 'sugarcrm' 
			subCtx = ctx.getSub({ 
				groups: [],
				basedir: schema
			}, ctx),
			scans = core.compileScans(subCtx)
		;
		if (!scans.length) {
			console.error(chalk.red("No scans"));
		} else {
			core.runScans(scans, subCtx)
				.then( function(results) {
					if (results && results.length) {
						console.log(
							util.format("%s, %s results.", chalk.green("OK"), 
							chalk.bold(results.length)));
					} else {
						console.error(chalk.yellow("Scans returned nothing"));
					}
				});
		}
	},

	/* Run processFile on each metadata file.
	 * Creates a subcontext with each new glob pattern.
	 * */
	runScans: function(scans, ctx) {
		return new Promise(function(resolveScans, rejectScans) {
			_.each(scans, function( pattern, i ) {
				console.log(util.format(chalk.grey("Scanning for")+" %s", pattern));
				var sub = ctx.getSub({
					group: ctx.groups[i],
					pathFormat: path.join( ctx.basedir, ctx.groups[i] )
				});
				glob( pattern, function(err, matches) {
					/* Turn each match into a core.processFile promise */
					tasks = _.map(matches, function(metafile) {
						return core.processFile(metafile, sub);
						//	.then(function(models) {
						//		console.log('TODO runScans processFile ready');
						//		console.log(models);
						//	});
					});
					/* Resolve after all processFile promises are done */
					Promise.all(tasks).then( function(results) {
						console.log(['tasks done', results]);
						resolveScans(results);
					}, rejectScans);
				});
			});
		});
	},

	compileScans: function(ctx) {
		var scans = [];
		_.each( extensionPoints.scans, function(group, groupName) {
			var globPattern = groupName.replace(/%\(([a-zA-Z]*)\)[sdj]/, '*');
			scans.push( path.join(ctx.basedir, globPattern) );
			ctx.groups.push( groupName );
		});
		return scans ;
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
	 *
	 * From the path name and group pattern that caused the match, creates
	 * a subcontext with the path parameters and additional reader parameters.
	 *
	 * Resolves to a list of invidia.model instances once the file 
	 * content has been loaded and scanned.
	 */
	processFile: function(fn, ctx) {
		return new Promise(function(resolve, reject) {
			var pathVars = core.parsePathVars(fn, ctx.pathFormat);
			core.readFile(fn, ctx).then(function(data) {
				var scan = extensionPoints.scans[ctx.group],
					readerDef = core.getReaderDef(ctx.group),
					sub = ctx.getSub({
						readerDef: readerDef,
						groupParams: pathVars,
					}),
					models = [];
				scan(fn, data, sub);
				//console.log([data['dictionary']['Account'], fn]);
				resolve(models);
			});
		});
	},
	/* Turn file group format into regex, match against path instance 
	 * and return dictionary holding placeholder names and instance value. 
	 * E.g.:
	 *       parsePathVars('/tmp/1.list', '/%(tag1)s/%(tag2)i')
	 *       -> { tag1: 'tmp', tag2: 1 }
	 */
	parsePathVars: function(fn, format) {
		var fmtExpr = /%\(([a-zA-Z_-]*)\)([sdj])/;
		function escapeRegEx(str) {
			return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
		};
		var vars = [],
			pos = 0,
			pattern = ''
		;
		while (true) {
			var start = format.substr(pos).search(fmtExpr),
				match = format.substr(pos+start).match(fmtExpr);
			if (!match) {
				pattern += escapeRegEx(format.substr(pos));
				break;
			}
			var offset = start + match[0].length,
				name = match[1]
			;
			pattern += escapeRegEx(format.substr(pos, pos+start));
			switch (match[2]) {
				case 's':
					pattern += '([a-zA-Z_-]*)';
					break;
				case 'd':
					pattern += '([0-9,\.+-]*)';
					break;
				case 'j':
					throw "Not implemented";
			}
			pos += offset;
			vars.push(name);
		}
		var matches = fn.match(pattern),
			dict = {};
		_.each(vars, function(varname, i) {
			dict[varname] = matches[i+1];
		});
		return dict;
	},
	/**
	 * Get list of additional static parameters to reader from path group.
	 */
	getReaderDef: function(group) {
		return (extensionPoints.readerDefs[group]) ?
			extensionPoints.readerDefs[group] : [];
	},

	/* Invoke a reader given a filename, promise parsed results.
	 * These readers are loaded through extensions.
	 */
	readFile: function(fn, ctx) {
		return readers[path.extname(fn)](fn, ctx);
	},

	/**
	 * Load extension points from module.
	 *
	 * Very crude, just manipulates globals in place.
	 * Perhaps later write proper lookup methods for extensions.
	 */
	loadExtensionFromModule: function(module) {
		_.each(['commands', 'readers', 'readerDefs', 'scans'], function(propname) {
			if (module[propname]) {
				/* in place extend */
				_.extend(
					extensionPoints[propname], module[propname]);
			}
		});
	},
	loadExtensions: function(dirname) {
		return new Promise(function(resolve, reject) {
			var pattern = path.join('lib', dirname, '*.js');
			if (!fs.existsSync(path.join('lib', dirname))) {
				throw util.format("No such directory: %s", dirpath);
			}
			glob(pattern, function(err, matches) {
				_.each(matches, function(extpath) {
					extfile = './'+path.join(dirname, 
						path.basename(extpath, path.extname(extpath)));
					var module = require(extfile);
					core.loadExtensionFromModule(module);
				});
				resolve();
			});
		});
	},

	/**
	 * Main entrypoint, requires config and extensions promises.
	 * Each argument corresponding to an ID in the commands dictionary is
	 * run in sequence.
	 */
	runMain: function(config) {

		return new Promise(function(resolve, reject) {

			var 
				/* use parsed ARGV options as command ID's */
				argv = require('minimist')(process.argv.slice(2)),
				/* filter cmdid/callback pairs from commands obj */
				cmds = _.filter(_.pairs(commands), function(pair, index, list) {
					var cmdid = pair[0];
					return typeof argv[cmdid] != 'undefined';
				}),
				/* create root context */
				rootCtx = new Context({ 
					argv: argv, 
					cmds: cmds,
					config: config, 
					db: knex(config.knex)
				});

			if (cmds.length) {
				var cmdSeries = [];
				_.each(cmds, function(pair, index, list) {

					var cmdid = pair[0], handler = pair[1],
						cmdCtx = rootCtx.getSub({ cmdid: cmdid });
						cmdAsync = Promise.promisify(handler),
						cmdPromise = cmdAsync(cmdCtx);

					cmdSeries.push(cmdPromise);
				});
				Promise.all(cmdSeries).then(function(results) {
					console.log(['cmdSeries results', results]);
					resolve(rootCtx);
				});

			} else {
				resolve( function() {
					console.log('Nothing to do');
				});
			}

		}).then(function() {
			console.log(chalk.grey("[main]") +' '+ chalk.blue("Done"));
		});
	}
};

/* share with the CommonJS/NodeJS world */
module.exports = _.extend({
		version: pkg.version,
		base: extensionPoints
	}, core);
