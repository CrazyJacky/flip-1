var Mobicore = (function() {
    //= core/app
    //= core/pager
    
    /* internals */
    
    function mapToEve(eventName) {
        return function() {
            eve.apply(eve, [eventName].concat(Array.prototype.slice.call(arguments, 0)));
        };
    } // mapToEve

    window.addEventListener('load', mapToEve('mobicore.load.doc'), false);
    
    return {
        App: App
    };
})();