Using RelaxNG to describe nested obects, ie. dicts 'n lists ala JSON.

Objects correspond to Elements.
Each element name is the key inherited from the parent container. 
Thus the root element has no name.

Each simple value is turned into an Attribute on the containing element.

--store-name
  Add name attributes, raising on conflicts.

element {
  element <complex> {
    attribute name { "<complex>" }
    element <sub> { 
      attribute name { "<sub>" }
      attribute <attr> { text };
    }
  }*
  element <simple> {
    attribute name { "<simple>" }
    attribute value { text }
  }*

TODO: first prototype, gather all elements and attributes into a schema
  with simple groups
TODO: use options to turn all or specific groups into expressions: 
  one, oneOrZero, many, manyOrZero, optional
TODO: next, create named elements and attribute expressions and reuse.
  for all with same name, or specific paths
