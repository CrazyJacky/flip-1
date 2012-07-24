
// req: 
// # Flip History Plugin

// This plugin interfaces with the HTML5 "pushState" API.  Each time a `flip.changed` event
// is intercepted an entry is pushed into the browser history.  Works pretty well in most
// cases but struggles a little in the multipage demo.

// if we support the history api
if (typeof window.history != 'undefined') {
    window.addEventListener('popstate', function(evt) {
        var state = evt.state || {};

        if (state.id && state.url) {
            var flipper = flip.get(state.id);
            if (flipper) {
                flipper.activate(state.url, null, evt);
            }
        }
    }, false);
    
    eve.on('flip.changed', function(newroute, oldroute, sourceEvent) {
        // if the source event is defined and has state, it's a pop state event and should be ignored
        if (sourceEvent && sourceEvent.state) {
            return;
        }
        
        if (newroute && newroute.url && newroute.flipper) {
            // push the state
            // TODO: add the url to allow it to be reloaded...
            window.history.pushState({
                id: newroute.flipper.id,
                url: newroute.url
            }, document.title);
        }
    });
} // if