var interleave = require('interleave'),
    fs = require('fs'),
    path = require('path');
    
task('core', function() {
    // build the core files
    interleave(['src/css/flip.styl', 'src/js/*.js'], {
        output: 'dist',
        wrap: ['glob']
    });
    
    interleave(['src/js/*.js'], {
        output: 'dist',
        wrap: ['amd'],
        targetTemplate: '<%= filename %>-<%= packageType %><%= ext %>'
    });
    
    /*
    // build the main file with all the includes
    interleave('src/js/flip.js', {
        data: JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')),
        after: ['uglify']
    });
    */
});

task('extras', function() {
    // build each of the css files
    interleave(['src/css/plugins/*.css', 'src/js/plugins/*.js'], {
        output: 'dist/plugins'
    });
    
    // build the transition styles
    interleave('src/css/transitions/*.*', {
        output: 'dist/transitions'
    });
});

task('default', ['core', 'extras']);