// TODO fix config loading
var knexconf = require('../.invidia/config').knex,
    knex = require('knex')(knexconf);

var bookshelf = require('bookshelf')(knex);

// see lib.sql for complete schema and fields
var JsSchema = bookshelf.Model.extend({
		tableName: 'schema',
	}),
	JsObj = bookshelf.Model.extend({
		tableName: 'dict',
		properties: function() {
		}
	}),
	JsArr = bookshelf.Model.extend({
		tableName: 'arr',
		items: function() {
		}
	}),

	// XML
	RngSchema = bookshelf.Model.extend({
		tableName: 'grammars',
		attributes: function() {
			return this.hasMany(Attribute);
		},
		elements: function() {
			return this.hasMany(Element);
		}
	}, {
	}),
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

	JsSchema: JsSchema,

	RngSchema: RngSchema,
	RngElement: RngElement,
	RngAttribute: RngAttribute
};


