#!/usr/bin/env coffee
fs = require 'fs'
yaml = require 'js-yaml'


main = ( argv ) ->

  interpreter = argv.shift()
  script = argv.shift()
  version = argv.shift()

  console.log "Testing for", version

  libsf = require './lib/sitefile'
  if libsf.version != version
    throw new Error "Version mismatch in lib sitefile: #{libsf.version}"

  pkg = require './package.json'
  if pkg.version != version
    throw new Error "Version mismatch in package.json: #{pkg.version}"

  bwr = require './package.json'
  if bwr.version != version
    throw new Error "Version mismatch in bower.json: #{bwr.version}"

  stf = yaml.safeLoad fs.readFileSync './Sitefile.yaml'
  if stf.sitefile != version
    throw new Error "Version mismatch in Sitefile.yaml: #{stf.sitefile}"

  0

process.exit main process.argv

