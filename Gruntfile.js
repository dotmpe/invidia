'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    exec: {
      default_config: {
        cmd: 'test -e .invidia/config.js || { mkdir .invidia; cp config.example.js .invidia/config.js; }'
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

    coffeelint: {
      options: {
        configFile: '.coffeelint.json'
      },
      app: [
        'migrations/**/*.coffee',
        'var/**/*.coffee',
        'lib/**/*.coffee',
        '*.coffee'
      ]
    },

    yamllint: {
      all: {
        src: [
          'Sitefile.yaml',
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

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: [
          'jshint:lib',
          'nodeunit'
        ]
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: [
          'jshint:test',
          'nodeunit'
        ]
      },
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
    'nodeunit'
  ]);

  // Default task.
  grunt.registerTask('default', [
    'lint',
    'test'
  ]);

};
