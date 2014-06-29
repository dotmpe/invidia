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

  npm install -g knex
  knex migrate:latest

Knex uses the ``knexfile.{js,coffee}`` in the local directory.

