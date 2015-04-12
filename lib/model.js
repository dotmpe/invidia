// TODO fix config loading
var knexconf = require('../.invidia/config').knex,
    knex = require('knex')(knexconf);

var bookshelf = require('bookshelf')(knex);

// see lib.sql for complete schema and fields
var
	Group = bookshelf.Model.extend({
		tableName: 'groups'
	}, {
	}),
	Expression = bookshelf.Model.extend({
		tableName: 'exprs'
	}, {
	}),
	DataType = bookshelf.Model.extend({
		tableName: 'datatypes'
	}, {
	}),

	JsSchema = bookshelf.Model.extend({
		tableName: 'schema',
	}),
	JsArr = bookshelf.Model.extend({
		tableName: 'arr',
		items: function() {
		}
	}),
	JsProp = bookshelf.Model.extend({
		tableName: 'props'
	}, {
	}),
	JsObj = bookshelf.Model.extend({
		tableName: 'dict',
		properties: function() {
			return this.hasMany(JsProp);
		}
	}),

	// XML
	RngElement = bookshelf.Model.extend({
		tableName: 'rngelements',
		expressions: function() {
			return this.hasMany(Expression);
		}
	}, {
	}),
	RngAttribute = bookshelf.Model.extend({
		tableName: 'rngattributes'
	}, {
	}),
	RngSchema = bookshelf.Model.extend({
		tableName: 'grammars',
		attributes: function() {
			return this.hasMany(RngAttribute);
		},
		elements: function() {
			return this.hasMany(RngElement);
		}
	}, {
	}),

	// XXX later, manage multipart extended schema
	Package = bookshelf.Model.extend({
		tableName: 'packages'
	}, {
	}),
	Module = bookshelf.Model.extend({
		tableName: 'modules'
	}, {
	}),
	Bean = bookshelf.Model.extend({
		tableName: 'beans'
	}, {
	}),
	Relation = bookshelf.Model.extend({
		tableName: 'modules'
	}, {
	}),
	Field = bookshelf.Model.extend({
		tableName: 'field'
	}, {
	})
;


module.exports = {

	Group: Group,
	Expression: Expression,
	DataType: DataType,

	JsSchema: JsSchema,
	JsObj: JsObj,
	JsArr: JsArr,
	JsProp: JsProp,

	RngSchema: RngSchema,
	RngElement: RngElement,
	RngAttribute: RngAttribute,

	Package: Package,
	Module: Module,
	Bean: Bean,
	Relation: Relation,
	Field: Field

};


