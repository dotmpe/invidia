
// load_db
//var envname = process.env.NODE_ENV,
//		knexconf = require('../.invidia/config').knex[envname],
//		knex = require('knex')(knexconf);


// see lib.sql for complete schema and fields
module.exports = function(dbconf) {

	var db = require('knex')(dbconf),
		bookshelf = require('bookshelf')(db);

	var JsProp = bookshelf.Model.extend({ tableName: 'props' }, { });
	var Expression = bookshelf.Model.extend({ tableName: 'exprs' }, { });
	var RngAttribute = bookshelf.Model.extend({ tableName: 'rngattributes' }, { });
	var RngElement = bookshelf.Model.extend({ tableName: 'rngelements',
			expressions: function() {
				return this.hasMany(Expression);
			}
		}, { });

	return {

		db: db,
		bookshelf: bookshelf,
		objecttypes: {

			Group: bookshelf.Model.extend({ tableName: 'groups' }, { }),
			Expression: Expression,
			DataType: bookshelf.Model.extend({ tableName: 'datatypes' }, { }),

			JsSchema: bookshelf.Model.extend({ tableName: 'schema', }),
			JsArr: bookshelf.Model.extend({ tableName: 'arr', items: function() { } }),
			JsProp: JsProp,
			JsObj: bookshelf.Model.extend({
				tableName: 'dict',
				properties: function() {
					return this.hasMany(JsProp);
				}
			}),

			// XML
			RngElement: RngElement,
			RngAttribute: RngAttribute,
			RngSchema: bookshelf.Model.extend({
				tableName: 'grammars',
				attributes: function() {
					return this.hasMany(RngAttribute);
				},
				elements: function() {
					return this.hasMany(RngElement);
				}
			}, {
			}),

			// XXX later, manage multipart extended schema
			Package: bookshelf.Model.extend({
				tableName: 'packages'
			}, {
			}),
			Module: bookshelf.Model.extend({
				tableName: 'modules'
			}, {
			}),
			Bean: bookshelf.Model.extend({
				tableName: 'beans'
			}, {
			}),
			Relation: bookshelf.Model.extend({
				tableName: 'relations'
			}, {
			}),
			Field: bookshelf.Model.extend({
				tableName: 'fields'
			}, {
			})
		}
	};
};
