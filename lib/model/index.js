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
			})
}

