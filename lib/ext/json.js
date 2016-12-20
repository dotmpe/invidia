
var
	_ = require('lodash'),
	fs = require('fs'),
	Promise = require('bluebird'),
	model = require('../model')
;


var jsonReaderAsync = function(fn/*,ctx*/) {
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

var jsonParseList = function(data, ctxExpr) {
	console.log('TODO jsonParseList', data, ctxExpr);
	/*
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
	}*/
};

var jsonParseObject;

var jsonParseAttribute = function(data, key, superElement) {
	var sub = data[key];
	if (_.isEmpty(sub)) {
	} else if (_.isObject(sub)) {
		/* recurse */
		var obj = model.JsObj.forge({ name: key });
		jsonParseObject(sub, obj);
		return obj;
	} else if (_.isArray(sub)) {
		/* recurse */
		var arr = model.JsArr.forge({ name: key, context: superElement });
		return jsonParseList(sub, arr);
	} else if (_.isString(sub)) {
		var prop = model.JsProp.forge({ name: key, context: superElement });
		superElement.properties.add(prop);
	} else if (_.isBoolean(sub)) {
	} else if (_.isDate(sub)) {
	} else if (_.isNumber(sub)) {
	} else {
		throw "Unhandled JSON data type "+sub;
	}
};

jsonParseObject = function(data, superElement) {
	var props = _.keys(data);
	_.each( props, function(property) {
		jsonParseAttribute(data, property, superElement);
	});
};

var jsonParse = function(data) {
	if (_.isEmpty(data)) { // TODO
	} else if (_.isObject(data)) {
		var obj = new model.JsObj();
		jsonParseObject(data, obj);
		return obj;
	} else if (_.isArray(data)) {
		var arr = new model.JsArr();
		jsonParseList(data, arr);
		return arr;
	} else { // TODO
	}
};

/**
 * Given file name/contents and the context,
 * capture (partial) schema from the external data.
 *
 * JSON has no elements or attributes.
 */
var jsonDataSchemaScan = function(fn, data, ctx) {
	return new Promise(function(resolve/*, reject*/) {

		var results = jsonParse(data, ctx);
		resolve(results);

	});
};

module.exports = {
	//invidia: '0.0.0',
	readers: {
		'json-simple': jsonReaderAsync
	},
	readerDefs: {
		'{**,*}.json': [ 'json-simple' ]
	},
	/* Scans: filegroup -> parseAsync */
	scans: {
		'{**,*}.json': jsonDataSchemaScan,
	},
};

