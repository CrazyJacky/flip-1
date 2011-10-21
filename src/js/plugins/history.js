(function() {
    // if we support the history api
    if (typeof window.history != 'undefined') {
        function handlePopState(evt) {
            var state = evt.state || {};

            console.log('popped state: ', state);
            if (state.route && ((! state.appid) || (state.appid === element.id))) {
                eve(evt.state.route, app, document.location.href, false);
            } // if
        } // handlePopState

        window.addEventListener('popstate', handlePopState, false);
    } // if

    eve.on('pager.change', function(section, data, href) {
        // window.history.pushState(data, document.title, href);
    });
})();