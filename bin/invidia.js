#!/usr/bin/env node

var 
	invidialib = require('../lib/')
	;

/* Get promises for config and extensions */
var config = invidialib.initConfig(),
	extensions = invidialib.loadExtensions('ext')
	;

/* Defer to main */
invidialib
	.runMain(extensions, config)
	;
