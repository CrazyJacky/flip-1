var interleave = require('interleave'),
    fs = require('fs'),
    path = require('path');
    
task('core', function() {
    // build the core files
    interleave(['src/css/flip.css', 'src/js/flip.core.js']);
    
    // build the main file with all the includes
    interleave('src/js/flip.js', {
        data: JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')),
        after: ['uglify']
    });    
});

task('extras', function() {
    // build each of the css files
    interleave(['src/css/plugins', 'src/js/plugins'], {
        path: 'dist/plugins'
    });
    
    // build the transition styles
    interleave('src/css/transitions', {
        path: 'dist/transitions'
    });
});

task('default', ['core', 'extras']);