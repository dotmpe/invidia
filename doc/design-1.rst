Looking at Relax NG and working out relational model.

Schema
  - id
  - name
  - ns
  - expr_id 

Element
  - id
  - name
  - datatype_id
  - expr_id
  - schema_id

Attribute
  - id
  - name
  - datatype_id
  - schema_id

Expressions
  - id
  - enum type [ element, attribute, group, choice, interleave, oneOrMore, zeroOrMore, optional ]
  - expr_seq_id
  - elm_id
  - atr_id

ExpressionSeq
  - id
  - seq:int
  - expr_id


Datatypes
  - id
  - type
  - data_type_library

Work in progress, some further ideas follow.


Additionally, to manage this data spread across files and customizations:

Module
  - id
  - name
  - path
  - list<Schemas>
  - bool ext

Package
  - id
  - name
  - list<Module> modules


And lastly some preliminary examples how to provide concrete use-cases:

BeanModule extends Module
  - list<Element> fields

or:

Layout extends Module
  - list<Layout> tree
  - View view

View extends Module
  - list<Field> fields

  ...

maybe:

Routes ...

etc.?

