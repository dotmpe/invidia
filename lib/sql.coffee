# Invidia model SQL Schema for Knex
module.exports =
	tables:
		schema: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.string('ns')
			table.string('data_type_library')
			table.string('root_elm_id').references('id').inTable('elements')
		elements: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('datatype_id').references('id').inTable('datatypes')
			table.uuid('expr_id').references('id').inTable('exprs')
			table.uuid('schema_id').references('id').inTable('schema')
		attributes: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('datatype_id').references('id').inTable('datatypes')
			table.uuid('schema_id').references('id').inTable('schema')
		exprs: (table) ->
			table.uuid('id').primary()
			table.enum('type', ['element', 'attribute', 'group', 'choice', 'interleave', 'oneOrMore', 'zeroOrMore', 'optional'])
			table.uuid('expr_id').references('id').inTable('exprs')
			table.uuid('elm_id').references('id').inTable('elements')
			table.uuid('atr_id').references('id').inTable('attributes')
		datatypes: (table) ->
			table.uuid('id').primary()
			table.string('type')
			table.string('data_type_library')

###
		XXX: wnat to mov this to extension
		packages: (table) ->
			table.uuid('id').primary()
			table.string('name')
		modules: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.string('path')
			#table.string('list')
		fields: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('module').references('id').inTable('modules')
###

