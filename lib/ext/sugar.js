/*
SugarModule extends Module
TODO: map module<->object names
TODO: use dir as module root and resolve M, V, C parts
*/
	
var 
	_ = require('underscore'),
	exec = require("child_process").exec,
	util = require('util'),
  Promise = require('bluebird')
  ;


var phpReaderAsync = function(fn) {
  var type = 'dictionary';
  var dfrd = new Promise(function(resolve, reject) {
    exec(util.format("php bin/php2json.php '%s' %s", fn, type), function(
        error, stdout, stderr
        )
      {
        if (error) {
          reject(error);
        } else {
          var data = {};
          data[type] = JSON.parse(stdout);
          resolve(data);
        }
      });
  });
  return dfrd;
};

var dictionaryGroupParser = function(fn, moduleName) {
  console.log('TODO dictionaryGroupParser');
};

module.exports = {
  //invidia: '0.0.0',
  readers: {
    '.php': phpReaderAsync
  },
  //commands: { },
  scans: {
    //dictionary: {
      'modules/%(moduleName)s/vardefs.php': dictionaryGroupParser,
      'metadata/%(relationName)sMetaData.php': dictionaryGroupParser
    //}
  }
}
