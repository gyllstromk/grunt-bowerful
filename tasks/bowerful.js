/*
 * grunt-bowerful
 * https://github.com/gyllstromk/grunt-bowerful
 *
 * Copyright (c) 2012 Karl Gyllstrom
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    var path = require('path'),
        util = require('util'),
        fs = require('fs');


  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

    grunt.registerMultiTask('bowerful', 'Install bower packages.', function() {
        var done = this.async();
        var deps = {};
        var configs = {};

        var bower = require('bower');
        var config = require('bower/lib/core/config');
        var Manager = require('bower/lib/core/manager');

        var packages = this.data.packages;
        config.directory = this.data.directory || 'components';
        config.dest = this.data.dest;
        config.destfile = this.data.destfile || 'assets';
        config.customtarget = this.data.customtarget || {};

        function buildConfig(packageName) {
            if (deps[packageName]) {
                return;
            }

            var base = path.join(config.directory, packageName.split('/').pop());
            var json = grunt.file.readJSON(path.join(base, 'component.json'));

            if (! json.main) {
                grunt.log.error(util.format('Package %s did not specify a `main` file in components.json.', packageName));
                grunt.log.error('Trying `package.json`');
                var content = grunt.file.readJSON(path.join(base, 'package.json'));
                json.main = content.main;
            }

            if (! json.main) {
                grunt.log.error('Nothing in `package.json`. Reverting to guesswork based on package name.');
                var guess = path.join(base, packageName + '.js');
                if (fs.existsSync(guess)) {
                    grunt.log.error(util.format('%s exists, assuming this is the correct file.', guess));
                    json.main = guess;
                } else {
                    grunt.log.error(util.format('Cannot find main file for %s. Please install manually (or file bug report to %s with your grunt.js).', packageName, 'https://github.com/gyllstromk/grunt-bowerful/issues'));
                }
            }

            if (! Array.isArray(json.main)) {
                json.main = [ json.main ];
            }

            deps[packageName] = Object.keys(json.dependencies || []);
            configs[packageName] = json;
            deps[packageName].forEach(buildConfig);
        }

        function installed(packages) {
            if (config.dest) {
                var written = {};
                var contents = {};

                Object.keys(packages).forEach(buildConfig);

                function write(packageName) {
                    var pkg = configs[packageName];
                    if (! pkg) {
                        return;
                    }

                    (deps[pkg.name] || []).forEach(function(dep) {
                        if (! written[dep]) {
                            write(dep);
                        }
                    });

                    pkg.main.forEach(function(file) {
                        var ext = path.extname(file);
                        if (! contents[ext]) {
                            contents[ext] = '';
                        }

                        var base = path.join(config.directory, pkg.name);

                        file = path.join(config.directory, pkg.name, file);

                        if (! fs.existsSync(file)) {
                            grunt.log.error(file + ' not found. Skipping.');
                        } else {
                            // if we havent specified a custom target default to same file
                            if(! config.customtarget[pkg.name] ) {
                                contents[ext] += grunt.file.read(file);
                            } else {
                                // write in an individual file
                                grunt.file.write(path.join(config.customtarget[pkg.name]), grunt.file.read(file));
                            }
                        }
                    });

                    written[pkg.name] = true;
                }

                grunt.util._.keys(configs).forEach(write);

                Object.keys(contents).forEach(function(ext) {
                    if( contents[ext] ) {
                        grunt.file.write(path.join(config.dest, config.destfile + ext), contents[ext]);
                    }
                });
            }

            done();
        }

        // manager endpointNames argument requires inverted packages
        var install = [];
        grunt.util._.keys(packages).forEach(function(each) {
            if (! fs.existsSync(path.join(config.directory, each))) {
                var version = packages[each];
                if (version) {
                    each += '#' + version;
                }

                install.push(each);
            } else {
                grunt.log.ok(each + ' already installed. Skipping.');
            }
        });

        var installField = [ 'install' ].concat(install);
        var options = {
            argv: {
                remain:   installField,
                cooked:   installField,
                original: installField
            }
        };

        if (install.length) {
            bower.commands
                .install(install, options)
                .on('end', function (data) {
                    installed(packages);
                }
            );
        } else {
            installed(packages);
        }
    });
};
