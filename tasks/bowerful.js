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
        var cherryPicks = {};

        var bower = require('bower');
        var config = require('bower/lib/core/config');
        var Manager = require('bower/lib/core/manager');

        var packages = this.data.packages;
        config.directory = this.data.store || 'components';
        config.dest = this.data.dest;
        config.destfile = this.data.destfile || 'assets';
        config.customtarget = this.data.customtarget || {};

        function buildConfig(packageName) {
            if (deps[packageName]) {
                return;
            }

            var base = path.join(config.directory, packageName.split('/').pop());

            var componentJson = path.join(base, 'bower.json');
            if (! fs.existsSync(componentJson)) {
                componentJson = path.join(base, 'component.json');
            }

            var json = {};

            if (fs.existsSync(componentJson)) {
                json = grunt.file.readJSON(componentJson);
            }

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

            var picks = cherryPicks[packageName] || {};
            if (picks.select) {
                json.main = json.main.filter(function (each) {
                    return picks.select.indexOf(each) !== -1;
                });
            }

            if (picks.exclude) {
                json.main = json.main.filter(function (each) {
                    return picks.exclude.indexOf(each) === -1;
                });
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

                var appendContent = function(file, ext) {
                    contents[ext] += grunt.file.read(file);
                };

                var updateContent = function( pkg, file, ext ) {

                    // if we havent specified a custom target default to same file
                    if(! config.customtarget[pkg.name] ) {
                        appendContent(file, ext);
                    } else {
                        // first use extension to allow lookup on config data
                        var _ext = ext.replace('.', ''); 

                        // check if we have a custom path based on extension for example customtarget['js'] 
                        // if the target exists use its file path destination, if they dont check to see
                        // if the general definition is a string example 'myfilename', if it is use it to name the file and add ext to it
                        // if we still dont have a valid target, append to our default merged file.
                        var _target = config.customtarget[pkg.name][_ext] ? 
                            config.customtarget[pkg.name][_ext] : 
                                typeof config.customtarget[pkg.name] === 'string' ? 
                                    config.customtarget[pkg.name] + ext :
                                    false;
                                    
                        if(grunt.file.isDir(file)) {
                            grunt.file.recurse(file, function(abspath, rootdir, subdir, filename) {
                                grunt.file.copy(abspath, path.join(_target, subdir, filename));
                            });
                        } else if( _target ) {
                            grunt.file.write(path.join(_target), grunt.file.read(file));
                        } else {
                            appendContent(file, ext);
                        }
                    }
                };

                var write = function(packageName) {
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
                            updateContent( pkg, file, ext );
                        }
                    });

                    written[pkg.name] = true;
                };

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
            var version = packages[each];

            cherryPicks[each] = {};

            if (typeof version === 'object') {
                [ 'select', 'exclude' ].forEach(function (inclusionType) {
                    if (version[inclusionType]) {
                        if (! Array.isArray(version[inclusionType])) {
                            version[inclusionType] = [ version[inclusionType] ];
                        }

                        cherryPicks[each][inclusionType] = version[inclusionType];
                    }
                });

                version = version.version;
            }

            if (! fs.existsSync(path.join(config.directory, each))) {
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
