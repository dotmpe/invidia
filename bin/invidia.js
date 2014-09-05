#!/usr/bin/env node
var usage = "\
Usage: \
	invidia.js --scan [ROOT]\
	invidia.js --show-file FILE \
	invidia.js --read-file FILE \
Options: \
	--scan       Run all available scans and update schema. \
	--read-file  Load and dump file using matching reader. \
	--show-file  Try all scans on file and dump results to console. \
";

var 
	invidialib = require('../lib/'),
	chalk = require('chalk'),
	version = require("../package.json").version
	;

/* Get promises for config and extensions */
invidialib.initConfig()
	.then(function(config) {

		invidialib.loadExtensions(config, 'ext')
			.then(function() {

				/* Defer to main */
				invidialib
					.runMain(config)
			});
	});
