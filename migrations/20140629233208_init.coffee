_ = require 'underscore'

sql = require '../lib/sql'
model = require '../lib/model'


exports.up = (knex, Promise) ->
	promises = []

	_.each sql.tables, (callback, tableName) ->
		promises.push(
			knex.schema.createTable tableName, callback
		)

	return Promise.all(promises)


exports.down = (knex, Promise) ->
	promises = []

	_.each sql.tables, (callback, tableName) ->
		promises.push(
			knex.schema.dropTable tableName
		)

	return Promise.all(promises)

