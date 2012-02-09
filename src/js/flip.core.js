var flip = (function() {
    
    //= block://sidelab/html5/qsa
    
    //= core/helpers
    
    //= core/route
    //= core/flipper
    
    return function(element, opts) {
        return new Flipper(element, opts);
    };
})();