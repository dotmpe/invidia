_ = require 'underscore'

schema = require '../lib/schema'
model = require '../lib/model'


exports.up = (knex, Promise) ->
	promises = []

	_.each schema.tables, (callback, tableName) ->
		promises.push(
			knex.schema.createTable tableName, callback
		)

	return Promise.all(promises)


exports.down = (knex, Promise) ->
	promises = []

	_.each schema.tables, (callback, tableName) ->
		promises.push(
			knex.schema.dropTable tableName
		)

	return Promise.all(promises)

