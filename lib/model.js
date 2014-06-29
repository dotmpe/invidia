var knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: 'invidia.sqlite'
	}
});

var bookshelf = require('bookshelf')(knex);

module.exports = {
	Schema: bookshelf.Model.extend({
		tableName: 'schema'
	}),
	Element: bookshelf.Model.extend({
		tableName: 'elements'
	}),
	Attributes: bookshelf.Model.extend({
		tableName: 'attributes'
	}),

	Modules: bookshelf.Model.extend({
		tableName: 'modules'
	}),
	Packages: bookshelf.Model.extend({
		tableName: 'packages'
	})

}

