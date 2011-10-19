var interleave = require('interleave'),
    fs = require('fs'),
    config = {
        aliases: {
            'eve': 'github://DmitryBaranovskiy/eve/eve.js',
            'interact': 'github://DamonOehlman/interact/interact.js',
            'classtweak': 'github://DamonOehlman/classtweak/classtweak.js',
            'deferred': 'github://cho45/jsdeferred/jsdeferred.js',
            'when': 'github://briancavalier/when.js/when.js',
            'underscore': 'github://documentcloud/underscore/underscore.js?v=1.1.7'
        }
    };

// build each of the builds
interleave('src', {
    multi: 'pass',
    path: 'dist',
    config: config
});

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