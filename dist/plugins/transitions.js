(function() {
    // if modernizr is not available, then abort
    if (typeof Modernizr != 'undefined') {
        // from the modernizr example
        var transEndEventNames = {
                'WebkitTransition' : 'webkitTransitionEnd',
                'MozTransition'    : 'transitionend',
                'OTransition'      : 'oTransitionEnd',
                'msTransition'     : 'msTransitionEnd', // maybe?
                'transition'       : 'transitionEnd'
            },
            transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

        window.addEventListener(transEndEventName, function(evt) {
            classtweak(evt.target, '-p-in -p-out');
        }, false);
    } // if
    
    eve.on('flip.change', function(newpage, oldpage) {
        if (oldpage && oldpage !== newpage) {
            classtweak(newpage.element, '+p-in -p-out');
            classtweak(oldpage.element, '-p-in +p-out');
        } // if
    });
})();