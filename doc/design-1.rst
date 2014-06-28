Looking at Relax NG and working out relational model.

Schema
  - id
  - roots

Element
  - id
  - name
  - list<ElementExpression> elements
  - list<AttributeExpression> attributes
  - dataType

Attribute
  - id
  - name
  - dataType

ElementExpression
  - FK element-id
  - enum type [ element, choice, zeroOrMore, group, optional ]
  - list<ElementExpression> ops1
  - list<Element> ops2 

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

