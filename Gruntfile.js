'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    exec: {
      default_config: {
        cmd: 'test -e .invidia/config.js && echo "Config exists: .invidia/config.js" || { mkdir .invidia; cp config.example.js .invidia/config.js; }'
      },
      version: {
        cmd: "git-versioning check"
      },
      bats: {
        cmd: "bats test/*-spec.bats"
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: [
          'lib/**/*.js',
        ]
      },
      test: {
        src: [ 'test/**/*.js' ]
      },
    },

    yamllint: {
      all: {
        src: [
          'config/*.yaml',
          'src/**/*.meta'
        ]
      }
    },

    nodeunit: {
      files: [
        'test/**/*_test.js'
      ],
    },

  });

  // auto load grunt contrib tasks from package.json
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('lint', [
    'jshint',
    'yamllint'
  ]);

  grunt.registerTask('test', [
    'exec:default_config',
    'nodeunit',
    'exec:bats'
  ]);

  grunt.registerTask('default', [
    'lint',
    'exec:version',
    'test'
  ]);

};
