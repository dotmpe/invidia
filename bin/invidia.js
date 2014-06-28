#!/usr/bin/env node

var 
	index = require('../'),
	invidia = require('../lib/')
	;

var config = invidia.initConfig(),
	extensions = invidia.loadExtensions('ext')
	;

invidia
	.runMain(config, extensions)
	;
