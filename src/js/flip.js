//@header
(function (glob) {
    
    //= block://sidelab/html5/qsa
    
    var _flippers = {};
    
    //= core/helpers
    
    //= core/route
    //= core/flipper
    
    function flip(element, opts) {
        var flipper = new Flipper(element, opts);
        
        // register the flipper in the list of flippers
        _flippers[flipper.id] = flipper;
        
        // return the new flipper
        return flipper;
    }
    
    flip.get = function(id) {
        return _flippers[id];
    };
    
    //@export flip
})(this);