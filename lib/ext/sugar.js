/*
   SugarModule extends Module
   TODO: map module<->object names
   TODO: use dir as module root and resolve M, V, C parts
   */

var
	_ = require('lodash'),
	path = require('path-extra'),
	exec = require("child_process").exec,
	util = require('util'),
	fs = require('fs'),
	Promise = require('bluebird')
;

var load_templates = function(fn_idx) {
	var tpls = {}, mod = require(fn_idx);//, dir = path.dirname(fn_idx);
	_.each(_.keys(mod), function(k) {
		var file = mod[k],
		data = fs.readFileSync(path.join('./var/template/',file))
		;
		tpls[k] = data;
	});
	return tpls;
};

var templates = load_templates('../../var/template/sugar.js');

/**
 * Use php2json binary to get the PHP data arrays from file. The root level
 * is made up of an dict with the variable names from the file, the second
 * readerDef argument indicates which to return. It may contain a comma ','
 * for multiple variables, it defaults to the sugar specific 'dictionary'.
 *
 * The return data thus is always a dict and includes the variable name in
 * its path. Mapping or selecting subpaths is done where wanted in invidia core.
 */
var phpReaderAsync = function(fn, ctx) {
	var varspec = ctx && ctx.readerDef ? ctx.readerDef[1] : 'dictionary';

	var dfrd = new Promise(function(resolve, reject) {
		exec(util.format("php bin/php2json.php '%s' %s", fn, varspec), function(
				error, stdout/*, stderr */
			) {
				if (error) {
					reject(error);
				} else {
					var data = JSON.parse(stdout);
					resolve(data);
				}
			});
	});
	return dfrd;
};

/**
 * Given file-name and contents, capture (partial) schema from the external data.
 * Return promise for new models.
 *
 * ctx.groupParams is used to pass any filegroup parameters specified in the scan.
 * Two different scan groups are handled currently here:
 *
 * 1. moduleName makes it interpret Module, Field, Index and Key models, and also
 *    Relation models with some cardinalities of one.
 *
 * 2. relationName groups yield data usually with Relation models of the many-to-many
 *    kind.
 *
 *
 */
var dictionaryGroupScan = function(fn, data, ctx) {
	var varspec = ctx && ctx.readerDef ? ctx.readerDef[1] : 'dictionary';

	return new Promise(function(resolve, reject) {

		if (ctx.groupParams.moduleName) {

			// get moduleName from
			var modName = ctx.groupParams.moduleName,
				lastChar = modName.length-1,
				// Need bean for
				objName = modName.substr(lastChar) === 's' ?
					modName.substr(0, lastChar) : modName,
				moduleElement = new ctx.model.Module({name:objName})
			;
			moduleElement.fetch().then(function (module) {
				if (module) {
					resolve();
					//reject('TODO sugar module update');
				} else {
					moduleElement.save().then(function (/*module*/) {

						// create Module base or Ext obj
						var
							modDict = data[varspec][objName];
							//fields = _.pluck( modDict.fields, 'name');

						Promise.all(
							_.each(modDict.fields, function(field) {
								return new ctx.model.Field({
									name: field.name,
									dataType: field.type
								}).save();
							})
						).then(function(results) {
							resolve('TODO module', results);
						}, reject);

					}, reject);
				}
			});

		} else if (ctx.groupParams.relationName) {
			var relName = ctx.groupParams.relationName;
			console.log('TODO amend Sugar module; add relation '+relName);
			resolve('TODO amend');

		} else {
			reject("Unable to handle context. ");
		}
	});
};

module.exports = {
	//invidia: '0.0.0',
	readers: {
		'php-rootvar': phpReaderAsync
	},
	//commands: { },
	/* Additional defines per file group */
	readerDefs: {
		'modules/%(moduleName)s/vardefs.php': ['php-rootvar', 'dictionary'],
		'metadata/%(relationName)sMetaData.php': ['php-rootvar', 'dictionary']
	},
	/* Scans: filegroup -> parseAsync */
	scans: {
		// vardef scanner, interpret Models, Fields and Relations
		'modules/%(moduleName)s/vardefs.php': dictionaryGroupScan,
		'metadata/%(relationName)sMetaData.php': dictionaryGroupScan
		// TODO: viewdefs, client defs; interpret Fields, Views, Layouts
	},
	template: {
		relation: function(ctx) {
			ctx.sugar.generate_compiler(templates['relation']);
		},
		id_field: function(/* ctx */) {
			return function() {
				return templates['id_field'];
			};
		}
	},
	ext: {
		generate_compiler: function (/* tpl */) {
			return function() {
			};
		}
	}
};
