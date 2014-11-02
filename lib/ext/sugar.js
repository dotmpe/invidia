/*
   SugarModule extends Module
   TODO: map module<->object names
   TODO: use dir as module root and resolve M, V, C parts
   */

var 
	_ = require('underscore'),
	path = require('path-extra'),
	exec = require("child_process").exec,
	util = require('util'),
	fs = require('fs'),
	Promise = require('bluebird'),
	model = require('../model')
;

var load_templates = function(fn_idx) {
	var tpls = {}, mod = require(fn_idx), dir = path.dirname(fn_idx);
	_.each(_.keys(mod), function(k) {
		var file = mod[k],
		data = fs.readFileSync(path.join('./var/template/',file))
		;
		tpls[k] = data;
	});
	return tpls;
};
var templates = load_templates('../../var/template/sugar.js');

var phpReaderAsync = function(fn, ctx) {
	var dictname = ctx && ctx.readerDef ? ctx.readerDef[1] : 'dictionary';
	var dfrd = new Promise(function(resolve, reject) {
		exec(util.format("php bin/php2json.php '%s' %s", fn, dictname), function(
				error, stdout, stderr
			) {
				if (error) {
					reject(error);
				} else {
					var data = {};
					data[dictname] = JSON.parse(stdout);
					resolve(data);
				}
			});
	});
	return dfrd;
};

/**
 * Given file name/contents and the context,
 * capture (partial) schema from the external data.
 */
var dictionaryGroupScan = function(fn, data, ctx) {
	var dictname = ctx && ctx.readerDef ? ctx.readerDef[0] : 'dictionary';

	console.log('dictionaryGroupScan', fn, data);

	return new Promise(function(resolve, reject) {

		if (ctx.groupParams.moduleName) {
			var modName = ctx.groupParams.moduleName,
				lastChar = modName.length-1,
				objName = modName.substr(lastChar) == 's' ?
					modName.substr(0, lastChar) : modName ;
				moduleElement = new model.Element({name:objName})
			;
			moduleElement.fetch().then(function (module) {
				if (module) {
					resolve();
					//reject('TODO sugar module update');
				} else {
					moduleElement.save().then(function (module) {

						// create Module base or Ext obj
						var 
							modDict = data[dictname][objName]
							fields = _.pluck( modDict.fields, 'name');
						Promise.all(
							_.each(modDict.fields, function(field) {
								return new model.Element({
									name: field.name,
									dataType: field.type
								}).save();
							})
						).then(function(results) {
							resolve('TODO module');
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
		'modules/%(moduleName)s/vardefs.php': ['php-rootvar', 'ditionary'],
		'metadata/%(relationName)sMetaData.php': ['php-rootvar', 'dictionary']
	},
	/* Scans: filegroup -> parseAsync */
	scans: {
		'modules/%(moduleName)s/vardefs.php': dictionaryGroupScan,
		'metadata/%(relationName)sMetaData.php': dictionaryGroupScan
	},
	template: {
		relation: function(ctx) {
			ctx.sugar.generate_compiler(templates['relation']);
		},
		id_field: function(ctx) {
			return function() {
				return templates['id_field'];
			}
		}
	},
	ext: {
		generate_compiler: function (tpl) {
			return function() {
			}
		}
	}
}
