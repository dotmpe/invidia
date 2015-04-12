#!/usr/bin/env coffee
fs = require 'fs'
yaml = require 'js-yaml'


main = ( argv ) ->

  interpreter = argv.shift()
  script = argv.shift()
  version = argv.shift()

  console.log "Testing for", version

  lib = require './lib/'
  if lib.version != version
    throw new Error "Version mismatch in lib: #{lib.version}"

  pkg = require './package.json'
  if pkg.version != version
    throw new Error "Version mismatch in package.json: #{pkg.version}"

  bwr = require './package.json'
  if bwr.version != version
    throw new Error "Version mismatch in bower.json: #{bwr.version}"

  0

process.exit main process.argv

