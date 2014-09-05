
var 
	_ = require('underscore'),
	fs = require('fs'),
	path = require('path-extra'),
	util = require('util'),
	Promise = require('bluebird'),
	model = require('../model')
;


var jsonReaderAsync = function(fn, ctx) {
	var dfrd = new Promise(function(resolve, reject) {
		fs.readFile(fn, 'utf8', function(error, data) {
			if (error) {
				reject(error);
			} else {
				var parsed = JSON.parse(data);
				resolve(parsed);
			}
		});
	});
	return dfrd;
};

var jsonParseAttribute = function(data, key, superElement) {
	var sub = data[key];
	if (_.isEmpty(sub)) {
	} else if (_.isObject(sub)) {
		/* recurse */
		var element = model.Element(key, superElement);
		return jsonParseObject(sub, element);
	} else if (_.isArray(sub)) {
		/* recurse */
		var element = model.Element(key, superElement);
		return jsonParseList(sub, element);
	} else if (_.isString(sub)) {
		var attr = model.Attributes(key, superElemet);
		superElement.attributes.add(attr);
	} else if (_.isBoolean(sub)) {
	} else if (_.isDate(sub)) {
	} else if (_.isNumber(sub)) {
	} else {
		throw "Unhandled JSON data type "+sub;
	}
}

var jsonParseList = function(data, ctxExpr) {
	_.each( data, function(item) {

	});

	if (_.isEmpty(sub)) { // TODO
	} else if (_.isObject(sub)) {
		//return jsonParseObject(sub, );
	} else if (_.isString(sub)) {
		var attr = model.Attributes(key, superElemet);
		superElement.attributes.add(attr);
	} else if (_.isBoolean(sub)) {
	} else if (_.isDate(sub)) {
	} else if (_.isNumber(sub)) {
	} else {
		throw "Unhandled JSON data type "+sub;
	}
};

var jsonParseObject = function(data, superElement) {
	var props = _.keys(data);
	_.each( props, function(property) {
		return jsonParseAttribute(data, property, superElement);
	});
};

/**
 * Given file name/contents and the context,
 * capture (partial) schema from the external data.
 *
 * JSON has no elements or attributes. 
 */
var jsonDataSchemaScan = function(fn, data, ctx) {
	return new Promise(function(resolve, reject) {
		resolve("TODO json scan");
	});
};

module.exports = {
	//invidia: '0.0.0',
	readers: {
		'.json': jsonReaderAsync
	},
	/* Scans: filegroup -> parseAsync */
	scans: {
		'{**,*}.json': jsonDataSchemaScan,
	},
}
