#!/usr/bin/env node

var index = require('../');
var invidia = require('../lib/');
var pkg = require('../package.json')


prog = require('commander')
	.version(pkg.version)
	.option('-S, --scan', 'Scan (find and update schema) from current dir.')
	.option('--showFile', 'XXX.')
	.option('-l, --listSchema', 'List local schema.')
	//.option('-r, --list-rules', 'List metafile name and content rules.')
	.option('-v, --verbose', 'Show more infomation.')
	.on('--help', function() {
		console.log();
		console.log('  Example');
		console.log();
		console.log('    invidia');
		console.log();
	})
	.parse(process.argv)

if (prog.listSchema) {
	invidia.listSchema();
}
else if (prog.scan) {
	invidia.scanDir('.');
}
else if (prog['show-file']) {
	console.log('show-file');
	console.log(arguments);
	invidia.showFile('./test.php');
}


