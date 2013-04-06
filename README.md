# grunt-bowerful: install + concat bower packages directly from grunt file.

Who needs a `components.json` file?! Not you.

## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-bowerful`

Then add this to your project's `grunt.js` gruntfile:

```js
grunt.initConfig({
    bowerful: {
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
            key/value pairs. 
        */

        customtarget: {
            jquery: 'web/js/vendor/jquery.js'
        },

        /**
            @packages (required) -> object of `package name: package version`
            key/value pairs. Version can be left blank.
        */

        packages: {
            bootstrap: '~2.2.1',
            jquery: '',
            ember: '~1.0.0-pre.2'
        },
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
