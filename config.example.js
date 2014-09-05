module.exports = {
	invidia: "0.0.0",
	newConfig: false,
	knex: {
		client: 'sqlite3',
		connection: {
			filename: './.invidia/dev.sqlite3'
		},
		migrations: {
			tableName: 'knex_migrations'
		}
	}
}
