module.exports =
	tables:
		schema: (table) ->
			table.uuid('id').primary()
			table.string('name')
		elements: (table) ->
			table.uuid('id').primary()
			table.uuid('schema').references('id').inTable('schema')
			table.uuid('elmexpr').references('id').inTable('elmexprs')
			table.uuid('atrexpr').references('id').inTable('atrexprs')
			table.string('name')
			table.string('dataType')
		attributes: (table) ->
			table.uuid('id').primary()
			table.uuid('schema').references('id').inTable('schema')
			table.string('name')
			table.string('dataType')
		elmexprs: (table) ->
			table.uuid('id').primary()
			table.enum('type', ['element', 'choice', 'zeroOrMore', 'group', 'optional'])
			table.uuid('ops_expr').references('id').inTable('elmexprs')
			table.uuid('ops_elm').references('id').inTable('elements')
		atrexprs: (table) ->
			table.uuid('id').primary()
			table.enum('type', ['attribute', 'choice', 'zeroOrMore', 'group', 'optional'])
			table.uuid('ops_expr').references('id').inTable('atrexprs')
			table.uuid('ops_atr').references('id').inTable('attributes')

		fields: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.uuid('module').references('id').inTable('modules')
		modules: (table) ->
			table.uuid('id').primary()
			table.string('name')
			table.string('path')
			#table.string('list')
		packages: (table) ->
			table.uuid('id').primary()
			table.string('name')


