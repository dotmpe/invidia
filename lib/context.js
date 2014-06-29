/*
 * Trying to build a context with subcontexts and
 * full attribute inheritance.
 *
 */
var 
	_ = require('underscore'),
	util = require('util')
	;

function Context(init, ctx) {
	this._instance = ++Context._i;
	_.each(init, function(v, k) {
		Object.defineProperty(this, k, {
			//__proto__: null,
			value: v,
			enumerable: true,
			configurable: true,
			writable: true,
		});
	}, this);
	this.path = function() {
		if (ctx && ctx.path) {
			return ctx.path() + '/' + this._instance;
		}
		return '/' + this._instance;
	};
	this.toString = function() {
		return this.constructor.name+':'+this.path();
	};
	this._subs = [];
};
Context.prototype.getSub = function(init) {
	var sub = null;/*_.find(this._subs, function(sub) {
		return init == sub._init;
	});
	if (sub) {
		return sub;
	}*/
	function SubContext(init, sup) {
		Context.call(this, init, sup);
	}
	SubContext.prototype = Object.create(this); //Object.create(Context.prototype);
	SubContext.prototype.constructor = SubContext;
	var sub = new SubContext(init, this);
	this._subs.push(sub);
	return sub;
};
Context._i = 0;

module.exports = {
	Context: Context
}
