# - http://groovy.codehaus.org/Validating+XML+with+RELAX+NG
#
# This is a JSON-esque representation of RelaxNG (XML syntax)
module.exports =
	grammar: 
		@xmlns: "http://relaxng.org/ns/structure/1.0"
		@datatypeLibrary: "http://www.w3.org/2001/XMLSchema-datatypes"

		- start:
				ref: @name: 'addressBook'
		- define:
				@name: 'addressBook'
				- element: @name: 'addressBook'
					- oneOrMore:
						- element: @name: 'card'
							- ref: @name: 'name'
							- ref: @name: 'email'
		- define:
				@name: 'name'
				- element: @name: 'name'
					- text
		- define:
				@name: 'email'
				- element: @name: 'email'
					- text

