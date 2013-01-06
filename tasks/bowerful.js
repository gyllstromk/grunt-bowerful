/*
 * grunt-bowerful
 * https://github.com/gyllstromk/grunt-bowerful
 *
 * Copyright (c) 2012 Karl Gyllstrom
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

    grunt.registerTask('bowerful', 'Install bower packages.', function() {
        var path = require('path'),
            fs = require('fs');

        var done = this.async();

        function installed(packages) {
            if (config.dest) {
                var written = {};
                var deps = {};
                var configs = {};
                var contents = {};

                Object.keys(packages).forEach(function(package) {
                    var json = grunt.file.readJSON(path.join(config.directory, package.split('/').pop(), 'component.json'));
                    if (! Array.isArray(json.main)) {
                        json.main = [ json.main ];
                    }

                    deps[package] = Object.keys(json.dependencies || {});
                    configs[package] = json;
                });

                function write(packageName) {
                    var package = grunt.file.readJSON(path.join(config.directory, packageName.split('/').pop(), 'component.json'));
                    (deps[package.name] || []).forEach(function(dep) {
                        if (! written[dep]) {
                            write(dep);
                        }
                    });

                    if (! Array.isArray(package.main)) {
                        package.main = [ package.main ];
                    }

                    package.main.forEach(function(file) {
                        var ext = path.extname(file);
                        if (! contents[ext]) {
                            contents[ext] = '';
                        }

                        var file = path.join(config.directory, package.name,
                            file);

                        if (! fs.existsSync(file)) {
                            grunt.log.error(file + ' not found. Skipping.');
                        } else {
                            contents[ext] += grunt.file.read(file);
                        }
                    });

                    written[package.name] = true;
                }

                grunt.utils._.keys(configs).forEach(write);

                Object.keys(contents).forEach(function(ext) {
                    grunt.file.write(path.join(config.dest, 'assets' + ext), contents[ext]);
                });
            }

            done();
        };

        this.requiresConfig('bowerful.packages');

        var bower = require('bower');
        var config = require('bower/lib/core/config');
        var Manager = require('bower/lib/core/manager');

        var packages = grunt.config.get('bowerful.packages');
        config.directory = grunt.config.get('bowerful.store') || 'components';
        config.dest = grunt.config.get('bowerful.dest');

        // manager endpointNames argument requires inverted packages
        var invert = {};
        grunt.utils._.keys(packages).forEach(function(key) {
            if (! fs.existsSync(path.join(config.directory, key))) {
                invert[packages[key]] = key;
            } else {
                grunt.log.ok(key + ' already installed. Skipping.');
            }
        });

        if (Object.keys(invert).length > 0) {
            new Manager(Object.keys(packages),
                { endpointNames: invert }).on('install', function() { installed(packages); }).resolve();
        } else {
            installed(packages);
        }
    });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('bowerful', function() {
    return 'bowerful!!!';
  });

};
