# Invidia model SQL Schema for Knex

unid_spec = ( table ) ->
		table.uuid('unid').primary()

unid_name_spec = ( table ) ->
		unid_spec( table )
		table.string('name')

versions = [

		schema: (table) ->
			unid_name_spec( table)
			table.string('id')
		grammars: (table) ->
			unid_name_spec( table)
			table.string('ns')
		elements: (table) ->
			unid_name_spec( table)
		attributes: (table) ->
			unid_name_spec( table)

	,

		schema: (table) ->
			unid_name_spec( table)
			table.string('id')

		dict: (table) ->
			unid_name_spec( table)
			table.string('properties')
		arr: (table) ->
			unid_name_spec( table)

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


# XXX: wnat to mov this to extension
		packages: (table) ->
			unid_name_spec( table )

		modules: (table) ->
			unid_name_spec( table )
			table.string('path')
			#table.string('list')

		beans: (table) ->
			unid_name_spec( table )

		relations: (table) ->
			unid_name_spec( table )

		fields: (table) ->
			unid_name_spec( table )
			table.string('dataType')
			# XXX table.uuid('module').references('id').inTable('modules')

	]


module.exports =
	tables: versions[ 1 ]

