Using RelaxNG to describe nested obects, ie. dicts 'n lists ala JSON.

Objects correspond to Elements.
Each element name is the key from the parent container. 
The root element has no name.

Each simple value is turned into an Attribute on the containing element.

Because of XML, each Invidia grammar holds one root object.
So it can rely on RelaxNG for validating structure.
TODO test rnv datatypes

But for more generic use, another model is needed: cf. JSON schema/properties.
With the given implementation, microformats are hard-ish
Need to isolate each block, and then validate its content structure.
No match-all solutions?

Many grammars. No single way to manage them. Sub grammars. Simple vs. advanced check
lists. Validation for particular purposes.
RNV_ reports on ARX and RVP too.

.. _RNV: http://www.davidashen.net/rnv.html

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
