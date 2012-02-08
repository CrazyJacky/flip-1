var interleave = require('interleave'),
    fs = require('fs'),
    path = require('path'),
    aliases = {
        'eve': 'github://DmitryBaranovskiy/eve/eve.js',
        'interact': 'github://DamonOehlman/interact/interact.js',
        'classtweak': 'github://DamonOehlman/classtweak/classtweak.js',
        'when': 'github://briancavalier/when.js/when.js'
    };
    
task('core', function() {
    // build each of the css files
    interleave(['src/css/flip.css', 'src/js/flip.js'], {
        aliases: aliases,
        after: ['uglify']
    });    
});

task('plugins', function() {
    // build each of the css files
    interleave(['src/css/plugins', 'src/js/plugins'], {
        path: 'dist/plugins',
        aliases: aliases
    });
});

task('default', ['core', 'plugins']);