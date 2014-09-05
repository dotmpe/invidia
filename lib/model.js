// TODO fix config loading
var knexconf = require('../.invidia/config').knex,
    knex = require('knex')(knexconf);

var bookshelf = require('bookshelf')(knex);

// see sql schema for fields
var Schema = bookshelf.Model.extend({
		tableName: 'schema',
		attributes: function() {
			return this.hasMany(Attribute);
		},
		elements: function() {
			return this.hasMany(Element);
		}
	}, {
	}),
	Element = bookshelf.Model.extend({
		tableName: 'elements',
		expressions: function() {
			return this.hasMany(Expression);
		}
	}, {
	}),
	Attribute = bookshelf.Model.extend({
		tableName: 'attributes'
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
	Module = bookshelf.Model.extend({
		tableName: 'modules'
	}, {
	}),
	Package = bookshelf.Model.extend({
		tableName: 'packages'
	}, {
	});


module.exports = {
	Schema: Schema,
	Element: Element,
	Attribute: Attribute
};


