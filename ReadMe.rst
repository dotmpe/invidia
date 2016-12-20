Invidia
=======
:Version: 0.0.2-dev
:Created: 2014-06-28
:description:
  Schema from (meta)data reverse engineering; specification, validation.

:package:

  .. image:: https://gemnasium.com/dotmpe/invidia.png
    :target: https://gemnasium.com/dotmpe/invidia
    :alt: Dependencies

:project:

  .. image:: https://coveralls.io/repos/dotmpe/invidia/badge.png
    :target: https://coveralls.io/r/dotmpe/invidia
    :alt: Coverage

  .. image:: https://secure.travis-ci.org/dotmpe/invidia.png
    :target: https://travis-ci.org/dotmpe/invidia
    :alt: Build

:repository:

  .. image:: https://badge.fury.io/gh/dotmpe%2Finvidia.png
    :target: http://badge.fury.io/gh/dotmpe%2Finvidia
    :alt: GIT

- Working to resove simple schema from JSON.
- Experiment involving SugarCRM vardefs.
- Analysis involving RelaxNG schema. See also amanda-mpe.

- :TODO: store schema in SQL (doc/schema.rst)
- :TODO: should try jing-trang for datatype support


Schema
-------
Run JSON schema tests::

  make test-json

- Data/schema mainly edited in YAML for convenience (``var/{data,schema}/``)
  Downloaded external schemas, dumped to YAML.

- Never sure if initial writing troubles with schema matching is due
  to which. Should try a few together perhaps to get as much as feedback as
  possible?

  - tv4
  - jsonschema (Python)

- Move all to a fork of https://github.com/json-schema/JSON-Schema-Test-Suite?

  And write a little script to iterate/adapt a few validators for comparison
  tests.


Install
-------
::

   $ npm install invidia [-g]

Likely not suited for global install yet.

To run the tests, some other programs are needed.
Ie. `rnv`. See Makefile.

Usage
-----
::

   $ invidia --scan sugarcrm
   $ invidia --update
   $ invidia --

History
---------------
`Changelog <./Changelog.rst>`_

License
--------
| Copyright (c) 2014 B. van Berkum
| Licensed under the GPLv3 license.

`Full text <./LICENSE>`_

----

- http://lxml.de/validation.html


