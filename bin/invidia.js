#!/usr/bin/env node

var 
	invidialib = require('../lib/')
	;

/* Get promises for config and extensions */
invidialib.initConfig()
	.then(function(config) {
		invidialib.loadExtensions('ext')
			.then(function() {
				/* Defer to main */
				invidialib
					.runMain(config)
					.then(function() {
						console.log(['end', arguments]);
					});
			});
	});
