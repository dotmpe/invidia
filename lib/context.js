/*
 * Trying to build a context with subcontexts and
 * full attribute inheritance.
 *
 * See dotmpe/node-sitefile for coffeescript implementation.
 */
var
	_ = require('lodash')
	;

function Context(init, ctx) {
	this._instance = ++Context._i;
	this.context = ctx;
	this._defaults = init;
	this._data = {};
	if (!_.isEmpty( ctx )) {
		this.prepare_properties( ctx._data );
	}
	this.prepare_properties( init );
	this.seed( init );
	this._subs = [];
}
Context.prototype.path = function() {
	if (this.context) {
		return this.context.path() + '/' + this._instance;
	}
	return '/' + this._instance;
};
Context.prototype.toString = function() {
	return this.constructor.name+':'+this.path();
};
Context.prototype._ctxGetter = function(k) {
	return function() {
		if (this._data.hasOwnProperty(k)) {
			return this._data[ k ];
		} else if (typeof this.context !== 'undefined') {
			return this.context[ k ];
		}
	};
};
Context.prototype._ctxSetter = function( k ) {
	return function( newValue ) {
		this._data[ k ] = newValue;
	};
};
Context.prototype.isEmpty = function( ) {
	return _.isEmpty( this._data );
};
Context.prototype.seed = function( obj ) {
	_.forEach( obj, ( function( v, k ) {
		this._data[ k ] = v;
	}).bind(this));
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
	sub = new SubContext(init, this);
	this._subs.push(sub);
	return sub;
};
Context.prototype.prepare_properties = function( obj ) {
	_.forEach(obj, ( function(v, k) {
		if (this._data.hasOwnProperty(k)) {
			return;
		}
		Object.defineProperty(this, k, {
			//__proto__: null,
			//value: v,
			get: this._ctxGetter( k ),
			set: this._ctxSetter( k ),
			enumerable: true,
			configurable: true,
			//writable: true,
		});
	}).bind(this));
};
Context.prototype.dump = function(subitems) {
	console.log( subitems );
	// build a table right to left, creating a column for each subcontext
	// traveling rootward
//	_.each _
};
Context._i = 0;
Context.name = "context-mpe";
Context.version = "0.0.1";


module.exports = Context;
