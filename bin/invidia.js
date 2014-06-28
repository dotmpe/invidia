#!/usr/bin/env node

var 
	index = require('../'),
	invidia = require('../lib/')
	;

var config = invidia.initConfig();
invidia.runMain(config);
