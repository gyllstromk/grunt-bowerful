# grunt-bowerful: install + concat bower packages directly from grunt file.

Who needs a `components.json` file?! Not you.

## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-bowerful`

Then add this to your project's `grunt.js` gruntfile:

```js
grunt.initConfig({
    bowerful: {
        dist: {
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
            },

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
                    // that, `package.json`) file will be used

                    select: [ 'handlebars.js' ],
                    version: '~1.0.0-rc.3'
                },

                ember: '~1.0.0-pre.2'
            },
        }
    }
```

And import tasks via:

```js
grunt.loadNpmTasks('grunt-bowerful');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## License
Copyright (c) 2012 Karl Gyllstrom  
Licensed under the MIT license.
