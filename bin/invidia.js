#!/usr/bin/env node

var 
	index = require('../'),
	invidia = require('../lib/')
	;

/* Get promises for config and extensions */
var config = invidia.initConfig(),
	extensions = invidia.loadExtensions('ext')
	;

/* Defer to main */
invidia
	.runMain(extensions, config)
	;
