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
	minimatch = require('minimatch'),
	chalk = require('chalk'),
	Promise = require('bluebird'),
	//yaml = require("js-yaml"),
	knex = require('knex'),

	pkg = require('../package.json'),
	Schema = require('./model').Schema,
	Context = require('./context')
;

/* Command-line argument handlers.
 * These are promisified (callback must be called to resolve promise)
 */
var commands = {
	'check': function(ctx, callback) {
		core.checkSchemaWithEngine(ctx, callback);
	},
	'validate': function(ctx, callback) {
		core.validateWithEngine(ctx, callback);
	},
	'scan': function(ctx, callback) {
		core.updateSchema(ctx, callback)
	},
	'show-file': function(ctx, callback) {
		core.showFile(ctx, callback);
	},
	'read-file': function(ctx, callback) {
		core.printRaw(ctx, callback);
	},
	'list-scans': function(ctx, callback) {
		console.log(
				_.keys( extensionPoints.scans));
	},
	'load-schema': function(ctx, callback) {
		core.loadSchema(ctx, callback);
	},
	'list-schema': function(ctx, callback) {
		core.listSchema().then(callback);
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
	readerDefs: {},
	engines: {},
	generators: {}
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

	updateSchema: function(ctx, callback) {
		/* XXX */
		var schemaDir = fs.existsSync(ctx.argv.scan) 
				? ctx.argv.scan : 'sugarcrm' 
			subCtx = ctx.getSub({ 
				groups: [],
				basedir: schemaDir
			}, ctx),
			scans = core.compileScans(subCtx)
		;
		if (!scans.length) {
			console.error(chalk.red("No scans"));
			callback();
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
					callback();
				});
		}
	},

	/* Process readFile or any matching.
	 * Creates a subcontext with each glob pattern.
	 */
	runScans: function(scans, ctx) {
		var tasks = [];

		_.each(scans, function( pattern, i ) {
			console.log(util.format(chalk.grey("Scanning for")+" %s", pattern));
			// prepare sub-context for processFile
			var
				pathFormat = path.join( ctx.basedir, ctx.groups[i] ),
				group = ctx.groups[i],
				sub = ctx.getSub({
					group: group,
					pathFormat: pathFormat,
					readerName: extensionPoints.readerDefs[group][0]
				});
			if (ctx.readFile) {
				/* show file */
				// XXX add './' or minimatch does not understand the pattern
				if (minimatch('./'+ctx.readFile, './'+pattern)) {
					tasks.push(
						core.processFile(ctx.readFile, sub)
					);
				}
			} else {
				/* scan dir */
				var matches = glob.sync( pattern );
				tasks = tasks.concat( _.map(matches, function(metafile) {
					return core.processFile(metafile, sub);
				}));
			}
		});

		/* Resolve after all files are processed */
		return new Promise(function(resolveScans, rejectScans) {
			Promise.all(tasks).then( function(results) {
				console.log('tasks done')
				//console.log(results);
				resolveScans(results);
			}, rejectScans);
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

	showFile: function(ctx, callback) {
		var schemaDir = fs.existsSync(ctx.argv.scan) 
				? ctx.argv.scan : 'sugarcrm' 
			subCtx = ctx.getSub({ 
				groups: [],
				readFile: ctx.argv['show-file'],
				basedir: schemaDir
			}, ctx)
			scans = core.compileScans(subCtx)
		;
		if (!scans.length) {
			callback("show-file: no scans");
			console.error(chalk.red("No scans"));
		} else {
			core.runScans(scans, subCtx).then(function() {
				callback();
			});
		}
	},

	/**
	 * Print list and return promise for Schema instances.
	 */
	listSchema: function() {
		return new Schema().fetch().then(function(models) {
			console.log("Schemas:", models);
		});
	},

	loadSchema: function(ctx, callback) {
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
			console.log(util.format(chalk.grey("Processing file")+" %s", fn));
			core.readFile(fn, ctx).then(function(data) {
				var scan = extensionPoints.scans[ctx.group],
					readerDef = core.getReaderDef(ctx.group),
					sub = ctx.getSub({
						readerDef: readerDef,
						groupParams: pathVars,
					});
				scan(fn, data, sub).then(function(results) {
					console.log("Resolve", fn, results);
					//console.log([data['dictionary']['Account'], fn]);
					resolve(results);
				});
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
		if (!format) {
			throw "Empty format? "+fn;
		}
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
		if (!readers[ctx.readerName]) {
			console.log("No reader", ctx.readerName);
		}
		return readers[ctx.readerName](fn, ctx);
	},

	checkSchemaWithEngine: function(ctx, callback) {
		var name = ctx.engine || 'rnv';
		extensionPoints.engines[name].validate_rng(ctx.argv['check'], callback);
	},
	validateWithEngine: function(ctx, callback) {
		var name = ctx.engine || 'rnv';
		extensionPoints.engines[name].validate_xml(ctx.argv['schema'], ctx.argv['validate'], callback);
	},

	generateSchema: function(ctx, callback){
		var name = ctx.generator || 'core';
		extensionPoints.generators[name](ctx, callback);
	},
	generateInstance: function(ctx, callback){
	},

	/* simply load the file. FIXME: need to choose between alt.readers */
	printRaw: function(ctx, callback) {
		if (typeof ctx.argv['read-file'] !== "string") {
			callback("read-file: Missing filename argument");
		}
		ctx.readerName = 'php-rootvar';
		core.readFile(ctx.argv['read-file'], ctx).then(function(data) {
			core.printTree(data);
			callback();
		});
	},

	printList: function(data, indent) {
		_.each(data, function(v, x) {
			if (_.isEmpty(v)) {
				console.log(indent, x+'.', null)
			} else if (_.isArray(v)) {
				console.log(indent+' '+x+'.');
				core.printList(v, indent+'  ');
			} else if (_.isObject(v)) {
				console.log(indent+' '+x+'.');
				core.printTree(v, indent+'  ');
			} else {
				console.log(indent, x+'.', v)
			}
		});
	},
	printTree: function(data, indent) {
		if (typeof indent == "undefined") {
			indent = '';
		}
		var keys = _.keys(data), v;
		_.each(keys, function(k) {
			v = data[k];
			if (_.isEmpty(v)) {
				console.log(indent, k, null)
			} else if (_.isArray(v)) {
				console.log(indent, k)
				core.printList(v, indent+'  ');
			} else if (_.isObject(v)) {
				console.log(indent, k)
				core.printTree(v, indent+'  ');
			} else {
				console.log(indent, k, v)
			}
		});
	},

	/**
	 * Load extension points from module.
	 *
	 * Very crude, just manipulates globals in place.
	 * Perhaps later write proper lookup methods for extensions.
	 */
	loadExtensionFromModule: function(module) {
		var extPoints = _.keys(extensionPoints);
		_.each(extPoints, function(propname) {
			if (module[propname]) {
				/* in place extend */
				_.extend(
					extensionPoints[propname], module[propname]);
			}
		});
	},
	/**
	 * TODO: use docopt get opts here
	 */
	loadExtensions: function(config, dirname) {
		return new Promise(function(resolve, reject) {
			/* load JavaScript extensions from lib subdir */
			var pattern = path.join('lib', dirname, '*.js');
			if (!fs.existsSync(path.join('lib', dirname))) {
				throw util.format("No such directory: %s", dirpath);
			}
			glob(pattern, function(err, matches) {
				_.each(matches, function(extpath) {
					extfile = './'+path.join(dirname, 
						path.basename(extpath, path.extname(extpath)));
					/* import and extend */
					var module = require(extfile);
					core.loadExtensionFromModule(module);
				});
				resolve();
			});
		});
	},

	/**
	 * Main entrypoint, requires config and extensions promises.
	 *
	 * Each option corresponding to an ID in the commands dictionary is
	 * run in sequence.
	 */
	runMain: function(config) {

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
			})
		;

		if (cmds.length) {
			var cmdSeries = [];
			_.each(cmds, function(pair, index, list) {
				var cmdid = pair[0], handler = pair[1],
					cmdCtx = rootCtx.getSub({ cmdid: cmdid });
					cmdAsync = Promise.promisify(handler),
					cmdPromise = cmdAsync(cmdCtx);
				cmdSeries.push(cmdPromise);
			});
			Promise.all(cmdSeries)
				.then(function() {
					console.log(chalk.grey("[main]") +' '+ chalk.blue("Done"));
					process.exit(0);
				});

		} else {
			console.log(chalk.grey("[main]") +' '+ chalk.blue("Nothing to do"));
			process.exit(1);
		}
	}
};

/* share with the CommonJS/NodeJS world */
module.exports = _.extend({
		version: pkg.version,
		base: extensionPoints
	}, core);
