var 
	exec = require("child_process").exec,
	util = require('util')
;

module.exports = {
	engines: {
		rnv: {
			validate_rng: function(schemaFile, callback) {
				var cmd = util.format("rnv -c %s", schemaFile);
				exec(cmd, function( error, stdout/*, stderr */) {
					if (error) {
						callback(error);
					}
					console.log("RNG checked", schemaFile, stdout);
					callback();
				});
			},
			validate_xml: function(schemaFile, xmlFile, callback) {
				var cmd = util.format("rnv %s %s", schemaFile, xmlFile);
				exec(cmd, function( error, stdout/*, stderr */) {
					if (error) {
						callback(error);
					}
					console.log("RelaxNG validated", xmlFile, stdout);
					callback();
				});
			},
		},
	}
};

