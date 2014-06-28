/*
 * Trying to build a context with subcontexts and
 * full attribute inheritance.
 *
 */
var 
	_ = require('underscore'),
	util = require('util')
	;

function Context(init) {
	_.each(init, function(v, k) {
		Object.defineProperty(this, k, {
			//__proto__: null,
			value: v,
			enumerable: true,
			configurable: true,
			writable: true,
		});
	}, this);
	this._subs = [];
	this.createSub = function(init) {
		var sub = null;//this.getSub(init);
		//if (sub) {
		//	return sub;
		//}
		function Sub() {
			Context.call(this, [init]);
		};
		Sub.prototype = this;//Object.create(Context.prototype);
		Sub.prototype.constructor = Context;
		sub = new Sub();
		this._subs.push(sub);
		return sub;
	};
	this.getSub = function(init) {
		return _.find(this._subs, function(sub) {
			return init == sub._init;
		});
	}
	/*
	this._reserved = [
		'get', 'set', 'update', 'createSub', 'getSub',
		'_reserved', '_initObj', '_subs', '_keys', '_super',
		'prototype', 'this', 'var', 
	];
	this._keys = [];
	this.get = function(key) {
		this._notReserved(key);
		return this[key];
	};
	this.set = function(key, value) {
		this._notReserved(key);
		if (this._keys.indexOf(key) == -1) {
			this._keys.push(key);
		}
		//this[key] = value;
		return this[key];
	};
	this._notReserved = function(key) {
		if (this._reserved.indexOf(key)) {
			throw util.format("Reserved keyword %s", key);
		}
	};
	this.update = function(obj) {
	};
	*/
};
module.exports = {
	Context: Context
}
