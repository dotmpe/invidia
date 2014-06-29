Configuration
______________

Manual config directory
-----------------------

- config is {./,~/,/etc/}{,.}invidia/config.js
- but nothing used from config yet

Manual database
----------------
Knex has a migrate util a bit like SQLAlchemy ORM.
::

  npm run dbversion
  npm run dbback
  npm run dblatest
  make dbup NAME=...

Knex uses the ``knexfile.{js,coffee}`` in the local directory.

