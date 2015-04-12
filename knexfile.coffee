# XXX find some way to deal with this

module.exports =

  #development: require('./.invidia/config').knex
  development:
    client: 'sqlite3'
    connection:
      filename: './dev.sqlite3'
    migrations:
      tableName: 'knex_migrations'

  testing:
    client: 'sqlite3'
    connection:
      filename: './test.sqlite3'
    migrations:
      tableName: 'knex_migrations'

  staging:
    client: 'postgresql'
    connection:
      database: 'my_db'
      user:     'username'
      password: 'password'
    pool:
      min: 2
      max: 10
    migrations:
      tableName: 'knex_migrations'

  production:
    client: 'postgresql'
    connection:
      database: 'my_db'
      user:     'username'
      password: 'password'
    pool:
      min: 2
      max: 10
    migrations:
      tableName: 'knex_migrations'
