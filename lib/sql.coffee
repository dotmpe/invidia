# Invidia model SQL Schema for Knex
module.exports =
	tables:

		schema: (table) ->
			table.uuid('unid').primary()
			table.string('id')
			table.string('name')

		dict: (table) ->
			table.uuid('unid').primary()
			table.string('name')
			table.string('properties')
		arr: (table) ->
			table.uuid('unid').primary()
			table.string('name')

		grammars: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.string('ns')
			table.string('datatype_lib_id')
				.references('id').inTable('datatype_libraries')
			table.string('start')
				.references('id').inTable('elements')

		elements: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('datatype_id')
				.references('id').inTable('datatypes')
			table.uuid('pattern_id')
				.references('id').inTable('patterns')
			table.uuid('grammar_id')
				.references('id').inTable('grammars')

		attributes: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('datatype_id')
				.references('id').inTable('datatypes')
			table.uuid('grammar_id')
				.references('id').inTable('grammars')

		patterns: (table) ->
			table.uuid('id').primary()
			table.enum('type', [
				'group', 'choice', 'interleave', 
				'oneOrMore', 'zeroOrMore', 'optional'
			])

		groups: (table) ->
			table.uuid('id').primary()
			table.uuid('pattern_id')
				.references('id').inTable('patterns')
			# XXX use object_{type,id} or SQL FK's
			table.uuid('object_id')
			table.enum('object_type', ['elements', 'attributes'])
			#table.uuid('elm_id')
			#	.references('id').inTable('elements')
			#table.uuid('atr_id')
			#	.references('id').inTable('attributes')

		datatypes: (table) ->
			table.uuid('id').primary()
			table.string('type')
			table.string('datatype_lib_id')
				.references('id').inTable('datatype_libraries')

		datatype_libraries: (table) ->
			table.uuid('id').primary()
			table.string('href')
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

