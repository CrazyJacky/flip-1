var interleave = require('interleave'),
    fs = require('fs'),
    path = require('path'),
    config = {
        aliases: {
            'eve': 'github://DmitryBaranovskiy/eve/eve.js',
            'interact': 'github://DamonOehlman/interact/interact.js',
            'classtweak': 'github://DamonOehlman/classtweak/classtweak.js',
            'when': 'github://briancavalier/when.js/when.js'
        }
    };
    
// build each of the css files
interleave(['src/css', 'src/js'], {
    multi: 'pass',
    path: 'dist',
    config: config
});    

// build each of the css files
interleave(['src/css/plugins', 'src/js/plugins'], {
    multi: 'pass',
    path: 'dist/plugins',
    config: config
});    

/*

// read the stylus files and process them
fs.readdir('src/css', function(err, files) {
    // iterate through the files
    files.forEach(function(file) {
        // read the file
        fs.readFile('src/css/' + file, 'utf8', function(readErr, data) {
            // render the stylus css
            stylus.render(data, { filename: file }, function(renderErr, css) {
                // write the output
                fs.writeFile('dist/' + path.basename(file, '.styl') + '.css', css);
            });
        });
    });
});

*/

/*

interleave('src/plugins', {
    multi: 'pass', 
    path: 'assets/plugins',
    config: config
});

// build each of the themse
interleave('src/themes', {
    multi: 'pass',
    path: 'assets/client/themes',
    config: config
});
*/