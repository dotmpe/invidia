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
			table.uuid('ops_expr').references('elmexprs')
			table.uuid('ops_elm').references('elements')
		atrexprs: (table) ->
			table.uuid('id').primary()
			table.enum('type', ['attribute', 'choice', 'zeroOrMore', 'group', 'optional'])
			table.uuid('ops_expr').references('atrexprs')
			table.uuid('ops_atr').references('attributes')

