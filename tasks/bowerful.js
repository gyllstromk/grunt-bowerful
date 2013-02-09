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
            util = require('util'),
            fs = require('fs');

        var done = this.async();

        function installed(packages) {
            if (config.dest) {
                var written = {};
                var deps = {};
                var configs = {};
                var contents = {};

                Object.keys(packages).forEach(function(package) {
                    var base = path.join(config.directory, package.split('/').pop());
                    var json = grunt.file.readJSON(path.join(base, 'component.json'));

                    if (! json.main) {
                        grunt.log.error(util.format('Package %s did not specify a `main` file in components.json.', package));
                        grunt.log.error('Trying `package.json`');
                        var content = grunt.file.readJSON(path.join(base, 'package.json'));
                        json.main = content.main;
                    }

                    if (! json.main) {
                        grunt.log.error('Nothing in `package.json`. Reverting to guesswork based on package name.');
                        var guess = path.join(base, package + '.js');
                        if (fs.existsSync(guess)) {
                            grunt.log.error(util.format('%s exists, assuming this is the correct file.', guess));
                            json.main = guess;
                        } else {
                            grunt.log.error(util.format('Cannot find main file for %s. Please install manually (or file bug report to %s with your grunt.js).', package, 'https://github.com/gyllstromk/grunt-bowerful/issues'));
                        }
                    }

                    if (! Array.isArray(json.main)) {
                        json.main = [ json.main ];
                    }

                    deps[package] = Object.keys(json.dependencies || {});
                    configs[package] = json;
                });

                function write(packageName) {
                    var package = configs[packageName];
                    if (! package) {
                        return;
                    }

                    (deps[package.name] || []).forEach(function(dep) {
                        if (! written[dep]) {
                            write(dep);
                        }
                    });

                    package.main.forEach(function(file) {
                        var ext = path.extname(file);
                        if (! contents[ext]) {
                            contents[ext] = '';
                        }

                        var base = path.join(config.directory, package.name);

                        file = path.join(config.directory, package.name, file);

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
