/* jshint -W061 */
/**
 * Main library file with invidia core.
 * Loads extensions, and contains commands and main entry point.
 *
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
	Context = require('./context')
;

function isInt(value) {
	return !isNaN(value) && (
			function(x) { return (x | 0) === x; })(parseFloat(value));
}

function assert(truth) {
	if (!truth) {
		throw "Not true";
	}
}

var core;
var extensionPoints;

/* Command-line argument handlers.
 * These are promisified (callback must be called to resolve promise)
 */
var commands = {

	'help': function(ctx/*, callback*/) {
		// TODO: replace with docopt?
		console.log( ctx.usage );
		console.log('Commands:');
		var x = null;
		for (x in commands) {
			console.log('--'+x);
		}
		process.exit(0);
	},

	'check': function(ctx, callback) {
		core.checkSchemaWithEngine(ctx, callback);
	},
	'validate': function(ctx, callback) {
		core.validateWithEngine(ctx, callback);
	},
	'scan': function(ctx, callback) {
		core.updateSchema(ctx, callback);
	},
	'show-file': function(ctx, callback) {
		core.showFile(ctx, callback);
	},
	/*
	 * Choose a reader to run for a file. Dont use any filegroup pattern or
	 * scanner to process, print raw dicts 'n list from file.
	 * TODO: this has hardcoded php-rootvar, also need function to list all
	 * available readers. and perhaps all readerdefs with this reader.
	 */
	'read-file': function(ctx, callback) {
		if (typeof ctx.argv['read-file'] !== "string") {
			callback("read-file: Missing filename argument");
		}
		ctx.readerDef = [ 'php-rootvar', 'dictionary' ];
		core.readFile(ctx.argv['read-file'], ctx).then(function(data) {
			if (ctx.argv.path) {
				data = core.resolvePath(data, ctx.argv.path);
				console.log(ctx.argv.path+':');
			} else {
				console.log('full tree:');
			}
			core.printAny(data);
			callback();
		});
	},
	'list-scans': function(/*ctx, callback*/) {
		console.log(_.keys( extensionPoints.scans));
	},
	'load-schema': function(ctx, callback) {
		core.loadSchema(ctx, callback);
	},
	'list-schema': function(ctx, callback) {
		core.listSchema(ctx).then(callback);
	},

	/**
	 * Create new schema with given name, and expression generated from instance
	 * data at given resource. To create from given expression, see init-schema.
	 *
	 * Invoke a reader for a file, get/map the data, and declare a schema for
	 * given name by transforming the instance data using
	 *
	 * TODO: set reader(def) on command-line
	 * TODO: load instance data, an declare schema...
	 * TODO: mapping needs setpath/unsetpath functions, unittesting thereon
	 *
	 */
	'x-create-schema': function(ctx, callback) {
		var name = ctx.argv['x-create-schema'];
		if (typeof name !== "string") {
			callback("x-create-schema: Missing name argument");
		}
		var fn = ctx.argv.file;
		ctx.readerDef = [ 'php-rootvar', ctx.argv.path, ctx.argv.map ];
		core.readFile(fn, ctx).then(function(data) {
			if (ctx.argv.map) {
				_.each(ctx.argv.map.split(','), function(map) {
					map = map.split(':');
					//var src=map[0], dest=map[1];
					// TODO: readFile mapping support: handle path on dest, and fix unset for src path
					//destd = core.resolvePath(data, src, true);
					//srcd = core.resolvePath(data, src);
					//destd[_.last(dest.split('/'))] = srcd;
					//core.deletePath(data, src);
				});
			}
			//console.log(fn, rDef, ctx.argv.path, data);
			//console.log(name+':');
			//core.printAny(data);
			var sub = ctx.getSub({
				extractor: 'js',
				data: data
			});
			core.extractSchema(sub, function() {
				callback();
			});
		});
	},
	/* Create schema with given name and `expression` */
	'x-init-schema': function(ctx, callback) {
		var name = ctx.argv['x-init-schema'];
		if (typeof name !== "string") {
			callback("x-init-schema: Missing name argument");
		}
		var expression = ctx.argv.expression,
			data = null;
		eval("data = "+expression);
		console.log("expression", expression, data);
		var sub = ctx.getSub({
			generator: ctx.argv.engine,
			data: data
		});
		core.generateSchema(sub, function() {
			callback();
		});
	}
};

/* Grouped metadata scan functions.
 */
var scans = {
};

/* Parsers for filetypes.
 */
var readers = {
};

extensionPoints = {
	commands: commands,
	scans: scans,
	readers: readers,
	readerDefs: {},
	engines: {},
	// move to mods later
	/**
	 * Generate accepts data from an expression and takes its other parameters from the
	 * context. The data can either be a data instance of the wanted schema type,
	 * or it can be a schema object. In case data is not an object, or has no type
	 * then it is handled as instance data.
	 */
	generators: {
		core: function(data, ctx, callback) {
			callback();
		},
		js: function(data, ctx, callback) {
			var schema = {
				type: null
			};
			if (!_.isObject(data)) {
			}
			if (_.isFunction(data)) {
				throw "no formula";
			} else if (typeof data === 'undefined') {
				return {
					type: 'null' // XXX?
				};
			} else if (_.isArray(data)) {
				schema = {
					type: 'array'
				};
				if (ctx.argv.items) {
					schema.items = ctx.argv.items;
				}
				if (ctx.argv.additionalItems) {
					schema.additionalItems = ctx.argv.additionalItems;
				}
				if (ctx.argv.maxItems) {
					schema.maxItems = parseInt(ctx.argv.maxItems, 10);
					assert(schema.minItems >= 0);
				}
				if (ctx.argv.minItems) {
					schema.minItems = parseInt(ctx.argv.minItems, 10);
					assert(schema.minItems >= 0);
				}
				if (ctx.argv.uniqueItems) {
					schema.uniqueItems = JSON.parse(ctx.argv.uniqueItems);
					assert(typeof schema.uniqueItems === 'boolean');
				}
				return schema;
			} else if (_.isObject(data)) {
				schema = data;
				schema.type = 'object';
				if (typeof ctx.argv.maxProperties !== 'undefined') {
					schema.maxProperties = parseInt(ctx.argv.maxProperties, 10);
					assert(schema.maxProperties >= 0);
				}
				if (typeof ctx.argv.minProperties !== 'undefined') {
					schema.minProperties = parseInt(ctx.argv.minProperties, 10);
					assert(schema.minProperties >= 0);
				}
				if (typeof ctx.argv.required !== 'undefined') {
					schema.required = eval(ctx.argv.required);
					assert(_.isArray(schema.required));
					assert(schema.required.length >= 1);
					var x;
					for (x in schema.required) {
						assert(_.isString(schema.required[x]));
					}
				}
				if (typeof ctx.argv.additionalProperties !== 'undefined') {
					schema.additionalProperties = boolean_or_object(ctx.argv.additionalProperties);
				}
				return schema;
			} else if (_.isString(data)) {
				schema = {
					type: 'string'
				};
				if (ctx.argv.maxLength) {
					schema.maxLength = parseInt(ctx.argv.maxLength, 10);
				}
				if (ctx.argv.minLength) {
					schema.minLength = parseInt(ctx.argv.minLength, 10);
				}
				if (ctx.argv.pattern) {
					schema.pattern = parseInt(ctx.argv.pattern, 10);
				}
				return schema;
			} else if (_.isNumber(data)) {
				schema = {
					type: isInt(data) ? 'integer' : 'number'
				};
				if (ctx.argv.multipleOf) {
					var mOf = schema.multipleOf = parseInt(ctx.argv.multipleOf, 10);
					console.log( mOf );
					// assert isInt(mOf) && mOf > 0
				}
				if (ctx.argv.maximum) {
					if (ctx.argv.exclusiveMaximum) {
						schema.exclusiveMaximum = parseInt(ctx.argv.exclusiveMaximum, 10);
					}
					schema.maximum = parseInt(ctx.argv.maximum, 10);
				}
				if (ctx.argv.minimum) {
					if (ctx.argv.exclusiveMinimum) {
						schema.exclusiveMinimum = parseInt(ctx.argv.exclusiveMinimum, 10);
					}
					schema.minimum = parseInt(ctx.argv.minimum, 10);
				}
				return schema;
			} else if (_.isBoolean(data)) {
				return {
					type: 'boolean'
				};
			} else if (_.isNull(data)) {
				return {
					type: 'null'
				};
			} else if (_.isEmpty(data)) {
				// XXX not happening
				throw "empty data";
			} else {
				throw "unrecognized data";
			}
			callback();
		},
		rng: function(/*data, ctx, callback*/) {
			throw "not implemented";
			//callback();
		}
	},
	extractors: {
		core: function(data, ctx, callback) {
			callback();
		},
		js: function(data, ctx, callback) {
			if (_.isArray(data)) {
			} else if (_.isObject(data)) {
				console.log(data);
			} else if (_.isString(data)) {
			} else if (_.isNumber(data)) {
			} else if (_.isBoolean(data)) {
			} else if (_.isNull(data)) {
			} else if (_.isEmpty(data)) {
				throw "empty data";
			} else {
				throw "unrecognized data";
			}
			callback();
		},
		rng: function(data, ctx, callback) {
			callback();
		}
	}
};

core = {

	/**
	 * Return a list of config files.
	 */
	findConfig: function() {
		var sysFile = 'invidia/config.js',
			usrFile = '.'+sysFile,
			files = [ sysFile, usrFile ],
			//etc = '/etc',
			cwd = process.cwd(),
			homedir = pathx.homedir(),
			configs = [],
			paths = [cwd],
			isroot = cwd.substr(0,1) === path.sep,
			cpath = cwd.split(path.sep)
		;
		cpath.pop(); // already have cwd,
		// now add everything above but stop at homedir
		for (var i=cpath.length-1;i>=0;i--) {
			var p = cpath.join(path.sep);
			if (isroot && p === '') { break; }// not looking in root.. p = path.sep;
			if (p === homedir) { break; }
			paths.push(p);
			cpath.pop();
		}
		console.log(chalk.grey(util.format("Search config in %s", paths)));
		/* Search each path for the support dir/file */
		_.each(paths, function(dirpath) {
			_.each(files, function(supportFile) {
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
			return [];
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
		var schemaDir = fs.existsSync(ctx.argv.scan) ?
						ctx.argv.scan : 'sugarcrm',
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

	/**
	 * Process ctx.readFile using all scanners with matching filegroup,
	 * or if not provided process all files found globbing for the filegroup
	 * (under ctx.basedir).
	 *
	 * Creates a subcontext for each group (with glob pattern) for
	 * processFile to work with. Returns a promise
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
			/* Add processFile task for this scan, if available for inputfile */
			if (ctx.readFile) {
				// XXX add './' or minimatch does not understand the pattern
				if (minimatch('./'+ctx.readFile, './'+pattern)) {
					tasks.push(
						core.processFile(ctx.readFile, sub)
					);
				}
			/* or add one processFile task for each file in group */
			} else {
				var matches = glob.sync( pattern );
				tasks = tasks.concat( _.map(matches, function(metafile) {
					return core.processFile(metafile, sub);
				}));
			}
		});

		/* Return deferred for processFile results */
		return new Promise(function(resolveScans, rejectScans) {
			Promise.all(tasks).then( function(results) {
				console.log('tasks done');
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

	/**
	 * Process all scans and print results.
	 * Invokes runScans
	 */
	showFile: function(ctx, callback) {
		var schemaDir = fs.existsSync(ctx.argv.scan) ?
				ctx.argv.scan : 'sugarcrm',
			subCtx = ctx.getSub({
				groups: [],
				readFile: ctx.argv['show-file'],
				basedir: schemaDir
			}, ctx),
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
	listSchema: function(ctx) {
		return new ctx.model.Schema().fetch().then(function(models) {
			console.log("Schemas:", models);
		});
	},

	loadSchema: function(/*ctx, callback*/) {
	},

	/**
	 * Promise to load and process a file to a set of model instances.
	 * Low-level function relies almost entirely on ctx parameters, see source.
	 *
	 * Specifically ctx.group indicates the filegroup, which should be the key
	 * to a scanner in extensionPoints.scans, and a reader in extensionPoints
	 * .readerDefs.
	 *
	 * This function gets an object with placeholder names and values from the
	 * filegroup pattern, and also gets a readerDef for the filegroup from the
	 * extensionPoints. Both are set on a sub-context passed to scan.
	 *
	 * Resolves to a list of invidia.model?, once the file
	 * content has been loaded and scanned.
	 */
	processFile: function(fn, ctx) {
		return new Promise(function(resolve/*, reject */) {
			var pathVars = core.parsePathVars(fn, ctx.pathFormat);
			console.log(util.format(chalk.grey("Processing file")+" %s", fn));
			core.readFile(fn, ctx).then(function(data) {
				var scan = extensionPoints.scans[ctx.group],
					readerDef = core.getReaderDef(ctx.group),
					subctx = ctx.getSub({
						readerDef: readerDef,
						groupParams: pathVars,
					});
				scan(fn, data, subctx).then(function(results) {
					console.log("Resolve", fn, results);
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
		}
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
					pattern += '([0-9,\\.+-]*)';
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
		if (!ctx.readerName) {
			if (ctx.readerDef) {
				ctx.readerName = ctx.readerDef[0];
			}
		}
		var reader = readers[ctx.readerName];
		return reader(fn, ctx);
	},

	/* Run file given with `check` argv option with engine.validate_rng */
	checkSchemaWithEngine: function(ctx, callback) {
		var name = ctx.engine || 'rnv';
		extensionPoints.engines[name].validate_rng(ctx.argv['check'], callback);
	},
	/* Run file given with `validate` argv option with engine.validate_xml,
	 * using `schema` specified at argv. */
	validateWithEngine: function(ctx, callback) {
		var name = ctx.engine || 'rnv';
		extensionPoints.engines[name].validate_xml(ctx.argv['schema'], ctx.argv['validate'], callback);
	},

	/* TODO: create schema from defaults & parameters, or other structured input */
	generateSchema: function(ctx, callback){
		var name = ctx.generator || 'core';
		var schema = extensionPoints.generators[name](ctx.data, ctx, callback);
		console.log(name, schema);
	},
	/* TODO: later. schema from instance data */
	extractSchema: function(ctx, callback){
		var name = ctx.extractor || 'core';
		ctx.data = typeof ctx.data === 'undefined' && {} || ctx.data;
		extensionPoints.extractors[name](ctx.data, ctx, callback);
	},
	/* TODO: later. templates for new instances? */
	generateInstance: function(/*ctx, callback*/){
	},

	resolvePath: function(data, path, create) {
		var elems = path.trim('/').split('/');
		var cpath = '';
		var data_;
		while (elems.length) {
			var elem = elems.shift();
			data_ = data[elem];
			cpath += '/'+elem;
			if (!data_) {
				if (create) {
					if (elems) {
						data[elem] = data_ = {};
					} else {
						return data;
					}
				} else {
					throw "No data for "+cpath;
				}
			}
			data = data_;
		}
		return data;
	},
	deletePath: function(data, path) {
		var elems = path.trim('/').split('/'),
			cpath = '',
			elem = null,
			d = data,
			d_,
			stack = []
				;
		while (elems.length) {
			elem = elems.shift();
			d_ = d[elem];
			cpath += '/'+elem;
			if (!d_) {
				break;
			}
			stack.push(d_);
			d = d_;
		}
		elems = cpath.trim('/').split('/');
		while (elems.length) {
			elem = elems.pop();
			d = stack.pop();
			if (_.keys(d) === [elem]) {
				delete d[elem];
			} else {
				break;
			}
		}
		console.log(data, path, d);
	},

	/* Util functions for printRaw */
	printAny: function(data) {
		if (_.isArray(data)) {
			core.printList(data);
		} else if (_.isObject(data)) {
			core.printTree(data);
		} else {
			console.log(data);
		}
	},
	printList: function(data, indent) {
		indent = indent || '';
		_.each(data, function(v, x) {
			if (_.isEmpty(v)) {
				console.log(indent, x+'.', null);
			} else if (_.isArray(v)) {
				console.log(indent+' '+x+'.');
				core.printList(v, indent+'  ');
			} else if (_.isObject(v)) {
				console.log(indent+' '+x+'.');
				core.printTree(v, indent+'  ');
			} else {
				console.log(indent, x+'.', v);
			}
		});
	},
	printTree: function(data, indent) {
		indent = indent || '';
		var keys = _.keys(data), v;
		_.each(keys, function(k) {
			v = data[k];
			if (_.isEmpty(v)) {
				console.log(indent, k+':', null);
			} else if (_.isArray(v)) {
				console.log(indent, k+':');
				core.printList(v, indent+'  ');
			} else if (_.isObject(v)) {
				console.log(indent, k+':');
				core.printTree(v, indent+'  ');
			} else {
				console.log(indent, k+':', v);
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
				throw util.format("No such directory: %s", dirname);
			}
			glob(pattern, function(err, matches) {
				if (err) {
					reject( err );
				}
				_.each(matches, function(extpath) {
					var extfile = './'+path.join(dirname,
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
	runMain: function(config, usage) {

		var
			/* use parsed ARGV options as command ID's */
			argv = require('minimist')(process.argv.slice(2)),
			/* filter cmdid/callback pairs from commands obj */
			cmds = _.filter(_.pairs(commands), function(pair/*, index, list */) {
				var cmdid = pair[0];
				return typeof argv[cmdid] !== 'undefined';
			}),

			envname = process.env.NODE_ENV,
			knexconf = config.knex[envname],

			/* create root context */
			rootCtx = new Context({
				argv: argv,
				cmds: cmds,
				usage: usage,
				config: config,
				model: require('./model')(knexconf).objecttypes
			})
		;

		console.log('Prepared models for', envname, 'with config', knexconf);

		if (cmds.length) {
			var cmdSeries = [];
			_.each(cmds, function(pair/*, index, list */) {
				var cmdid = pair[0], handler = pair[1],
					cmdCtx = rootCtx.getSub({ cmdid: cmdid }),
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

/* jshint +W061 */
