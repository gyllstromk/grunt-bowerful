# grunt-bowerful

This grunt plugin enables you to install + concat bower packages directly from grunt file, *without* needing a seperate `component.json`/`bower.json` file. Bower packages are specified directly within the grunt file itself.

By default, files are concatenated and written to the `dest` location according to type. For example, all `.js` files are concatenated to `<dest>/<destfile>.js`. Importantly, the *order* of concatenation is based on the dependency structure indicated by the bower component files. For example, if component X relies on jQuery, X will be included in the file *after* jQuery.

## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-bowerful`

Then add this to your project's `Gruntfile.js`:

```js
grunt.initConfig({
    bowerful: {
        dist: {
            /**
                @packages (required) -> object of `package name: package version`
                key/value pairs. Version can be left blank.
            */

            packages: {
                bootstrap: '~2.2.1',
                jquery: '', // when version not specified, most recent will be
                            // used
                handlebars: {
                    // use the 'select' field to indicate the particular files
                    // to be used. Otherwise, all files specified in the `main`
                    // field of the package's `component.json` (or, failing
                    // that, `package.json`) file will be used. This may be
                    either a `String` or `Array`

                    select: [ 'handlebars.js' ],

                    // additionally, use the `exclude` field to indicate files
                    // you *do not* wish to include in the concatenated
                    // version. This may be either a `String` or `Array`

                    exclude: [ 'handlebars.runtime.js' ],
                    version: '~1.0.0-rc.3'
                },

                ember: '~1.0.0-pre.2'
            },

            /**
                store (optional) -> path where components are installed. defaults
                to 'components'
            */

            store: 'components',

            /**
                dest (optional) -> directory where files will be merged. Merged
                files take the form:

                    assets[.extension] = { merged files of extension type }

                e.g. all JS from bower packages will end up in assets.js; all css in assets.css

                Files are merged according to dependency rules, such that a file is
                concatenated after files upon which it depends.
            */

            dest: 'public',

            /**
                destfile (optional) -> filename that will be used when files are merged. Merged
                files will default to 'assets' 
            */

            destfile: 'assets',

            /**
                customtarget (optional) -> file targets can be manually specified. 

                string - fullpath string without any extenstion, this will be added automaticly.

                key/value pairs. - fullpath string with extensions, extensions can be overwritten. 
                eg: Changing ext to something else, example '.less' or '.scss' 
            */

            customtarget: { 
                // this will generate jquery.js and jquery.css files if they exist on package
                jquery: 'web/js/vendor/jquery', 
                // note that you can overwrite the filename and extension to anything else.
                otherlib: {
                    js: 'path/to/destination.js',
                    css: 'path/to/destination.scss'
                }
            }
        }
    }
```

And import tasks via:

```js
grunt.loadNpmTasks('grunt-bowerful');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Contributers

* @mitermayer
* @johannestroeger

## License
Copyright (c) 2012 Karl Gyllstrom  
Licensed under the MIT license.
