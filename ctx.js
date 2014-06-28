/**
 * Experimenting with context object.
 */
var 
	_ = require('underscore'),
	util = require('util')
;

function Context(init, ctx) {
	this._instance = ++Context._i;
	console.log(['new Context', init]);
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
}
Context.prototype.getSub = function(init, sup) {
	function SubContext(init, sup) {
		Context.call(this, init, sup);
	}
	SubContext.prototype = Object.create(ctx); //Object.create(Context.prototype);
	SubContext.prototype.constructor = SubContext;
	return new SubContext(init, ctx);
};
Context._i = 0;

var ctx = new Context({foo:'bar', y: 2});
console.log(['expect bar', ctx.foo]);
console.log(['expect 2', ctx.y]);
var sub = ctx.getSub({x: 1, y: 'z'});
console.log(['expect 2', ctx.y]);
console.log(['expect z', sub.y]);
console.log(['expect 1', sub.x]);
console.log(['expect bar', sub.foo]);
console.log(['expect Context:/1', ctx.toString()]);
console.log(['expect SubContext:/1/2', sub.toString()]);
