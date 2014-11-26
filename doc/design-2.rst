Looked at RNG, SugarCRM entities design-1
Went ahead to test some RNG validators, and write schema.

Need to step back and look at dicts and lists.
Using JSON schema, same notation for schema and instance data.

Specifications:

- Objects w/ Properties
- Arrays w/ Items
- And a number of scalar types, see JSON schema.

Any piece of this spec can be considered a schema.
Each is itself an Object, described by JSON schema.

The id attribute of a schema object sets or alters 
the base URI of the document.

Then there is $schema, and $ref and some things in flux: allOf, anyOf
in v4 and probably merge in v5.


