fs = require 'fs'
path = require 'path'
glob = require 'glob'

yaml = require 'js-yaml'
tv4 = require 'tv4'


fn = 'var/schema/draft-04.yaml'
jsonSchema = yaml.safeLoad fs.readFileSync fn, 'utf8'
jsonSchemaUrl = jsonSchema['id']
#jsonSchemaUrl = "http://json-schema.org/draft-04/schema#"
tv4.addSchema( jsonSchemaUrl, jsonSchema )
for fn in glob.sync 'var/schema/*.yaml'
	bn = path.basename fn, '.yaml'
	schema = yaml.safeLoad fs.readFileSync fn, 'utf8'
	if schema['$schema']
		# test as json schema
		rs = tv4.validateResult schema, jsonSchema
		if rs.valid
			console.log fn, 'is a valid JSON schema'
		else
			console.log rs.error, rs.missing

	data_fn = "var/data/#{bn}.yaml"
	if fs.existsSync data_fn
		data = yaml.safeLoad fs.readFileSync data_fn, 'utf8'
		# test as json schema
		rs = tv4.validateResult data, schema
		if rs.valid
			console.log data_fn, "validates against #{fn}"
		else
			console.log rs.error, rs.missing

