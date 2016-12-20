#!/usr/bin/env node
/* TODO: maybe replace minimist and setup for docopt */
var usage = ' \n\
Usage: \n\
	invidia.js --scan [ROOT] \n\
Options: \n\
	--help \n\
	--scan       TODO. \n\
';

var
	invidialib = require('../lib/'),
	version = require("../package.json").version
;

//docopt(usage)

/* Get promises for config and extensions */
invidialib.initConfig()
	.then(function(config) {

    /* Defer to main */
    invidialib
      .runMain(config, usage)
	});

