element [relationName] {
	attribute name { "[relationName]"}
	attribute relationship_type { }
	// one-to-one, many/one..
	attribute lhs_module { "[lhsModule]"}
	attribute lhs_key { "[lhsKey]"}
	attribute lhs_table { "[lhsTable]"}
	attribute rhs_module { "[rhsModule]"}
	attribute rhs_key { "[rhsKey]"}
	attribute rhs_table { "[rhsTable]"}

	// many-to-many
	attribute join_key_lhs {}
	attribute join_key_rhs {}
	attribute join_table { "[]" }

	// relationship_type = user-based
	attributes user_field {}

	attributes relationship_role_column { "module" }
	attributes relationship_role_column_value { "[lhsModule]" }
}

