// TODO fix config loading
var knexconf = require('../.invidia/config').knex,
    knex = require('knex')(knexconf);

var bookshelf = require('bookshelf')(knex);

module.exports = {
	// see sql schema for fields
	Schema: bookshelf.Model.extend({
		tableName: 'schema'
	}),
	Element: bookshelf.Model.extend({
		tableName: 'elements'
	}),
	Attributes: bookshelf.Model.extend({
		tableName: 'attributes'
	}),

	Module: bookshelf.Model.extend({
		tableName: 'modules'
	}),
	'Package': bookshelf.Model.extend({
		tableName: 'packages'
	})

}

