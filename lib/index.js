/* jshint -W061 */
/**
 * Main library file with invidia core.
 * Loads extensions, and contains commands and main entry point.
 *
 */
var
	_ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	ospath = require('ospath'),
	util = require('util'),
	chalk = require('chalk'),
	Promise = require('bluebird'),
	Context = require('nodelib').Context,
	pkg = require('../package.json')
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

	'help': function(/*ctx, callback*/) {
		console.log('Commands:');
		var x = null;
		for (x in commands) {
			console.log('--'+x);
		}
		process.exit(0);
	},

	'scan': function(/*ctx, callback*/) {
	  data = core.extractors.js();
	  //core.generators.js(data, ctx, callback);
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
					assert(false);
					//schema.additionalProperties = boolean_or_object(ctx.argv.additionalProperties);
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
			homedir = ospath.home(),
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
			cmds = _.filter(_.toPairs(commands), function(pair/*, index, list */) {
				var cmdid = pair[0];
				return typeof argv[cmdid] !== 'undefined';
			}),
			envname = process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
			/* create root context */
			rootCtx = new Context({
				env: envname,
				argv: argv,
				cmds: cmds,
				usage: usage,
				config: config,
			})
		;

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
