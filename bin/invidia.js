#!/usr/bin/env node
/* TODO: maybe replace minimist and setup for docopt */
var usage = ' \n\
Usage: \n\
	invidia.js --scan [ROOT] \n\
	invidia.js --show-file FILE \n\
	invidia.js --read-file FILE \n\
Options: \n\
	--help \n\
	--scan       Run all available scans and update schema. \n\
	--read-file  Load and dump file using matching reader. \n\
	--show-file  Try all scans on file and dump results to console. \n\
';

var
	//docopt = require('docopt'),
	invidialib = require('../lib/'),
	version = require("../package.json").version
;

//docopt(usage)

/* Get promises for config and extensions */
invidialib.initConfig()
	.then(function(config) {

		invidialib.loadExtensions(config, 'ext')
			.then(function() {

				/* Defer to main */
				invidialib
					.runMain(config, usage)
			});
	});
