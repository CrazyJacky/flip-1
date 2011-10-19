var Pager = function(element, opts) {
    // initialise opts
    opts = opts || {};
    opts.title = opts.title || 'Untitled App';
    
    /* internals */
    
    var app,
        activeSection,
        events = {
            activating: 'pager.activating',
            data: 'pager.data'
        },
        history = opts.history || window.history,
        reUrl = /^(\w+\:\/\/.*\/)(.*)$/,
        pagePath = document.location.href.replace(reUrl, '$1'),
        storage = {};
        
    function getRelativePath(href) {
        var pageParts = pagePath.split('/'),
            pathParts = href.replace(reUrl, '$1').split('/');
            
        pathParts.splice(0, pageParts.length);
        
        return pathParts.join('/') + href.replace(reUrl, '$2');
    } // getRelativePath
        
    function getSectionData(section) {
        var data = {}, reValidAttr, sourceData = section.dataset;
        
        // if we don't have dataset data, then look through the attributes
        if (! sourceData) {
            sourceData = section.attribiutes;
            reValidAttr = /^data\-/i;
        } // if
        
        // get the state for the section
        for (var key in sourceData) {
            if ((! reValidAttr) || reValidAttr.test(key)) {
                data[key] = sourceData[key];
            } // if
        } // for
        
        // if we have an element id, then add the app id
        if (element.id) {
            data.appid = element.id;
        } // if

        return data;
    } // getSectionData
        
    function init() {
        var key, routables, ii, firstElement;
        
        // if the id is an object, then 
        if (typeof element == 'string' || element instanceof String) {
            element = document.querySelector('#' + element);
        } // if

        if ((! element) || (! element.querySelector)) {
            throw new Error('A containing element is required to create a new app');
        } // if

        // ensure the element has an id
        if (element.id) {
            for (key in events) {
                events[key] += '.' + element.id;
            } // for
        } // if

        // find the routable elements
        routables = element.querySelectorAll('*[data-route]');
        
        // iterate through the routables and defined handlers
        for (ii = 0; ii < routables.length; ii++) {
            initRoutable(routables[ii]);
        } // for
        
        // bind event handlers
        element.addEventListener('click', handleClick, false);
        element.addEventListener('touchstart', handleTouchStart, false);
        window.addEventListener('popstate', handlePopState, false);

        // look for the active section
        firstElement = element.querySelector('section.p-active') || 
            element.querySelector('section[data-route="/"]') || 
            element.querySelector('section');

        // activate the first selected element
        activate(firstElement);
    } // init
    
    function initRoutable(routable) {
        var url = routable.attributes['data-route'].value;
        
        eve.on(url, function(href, updateState) {
            // only handle route events for this app
            if (this === app) {
                return activate(routable, href, updateState);
            } // if
        });
    } // initRoutes
    
    function isRoute(target) {
        var routed = false;
        
        if (target && target.href) {
            var path = getRelativePath(target.href),
                routeResults = eve(path, app, path);

            for (var ii = 0; routeResults && ii < routeResults.length; ii++) {
                routed = routed || routeResults[ii];
            } // for
        } // if
        
        return routed;
    } // isRoutable
    
    function handleClick(evt) {
        if (isRoute(evt.target)) {
            evt.preventDefault();
        } // if
    } // handleClick
    
    function handlePopState(evt) {
        var state = evt.state || {};
        
        console.log('popped state: ', state);
        if (state.route && ((! state.appid) || (state.appid === element.id))) {
            eve(evt.state.route, app, document.location.href, false);
        } // if
    } // handlePopState
    
    function handleTouchStart(evt) {
        if (isRoute(evt.target)) {
            evt.preventDefault();
        } // if
    } // handleTouchStart
    
    /**
    The `whenOk` function is used to parse results from triggering an eve event
    and determining whether the event has handled ok.  If an event returns undefined,
    true or a function then the results may be ok.
    */
    function whenOk(eveResults, callback) {
        var ok = true,
            promises = [];
            
        // ensure eve results is an array
        // iterate through the results
        for (var ii = 0; eveResults && ii < eveResults.length; ii++) {
            ok = ok && (typeof eveResults[ii] == 'undefined' || eveResults[ii]);
            if (ok && typeof eveResults[ii] != 'undefined') {
                promises.push(eveResults[ii]);
            } // if
        } // for
        
        // if the results are ok, then process
        if (ok) {
            when.all(promises, callback);
        } // if
    } // whenOk
    
    /* exports */
    
    function activate(section, href, updateState) {
        // initialise update state to a valid value
        updateState = typeof updateState == 'undefined' || updateState;
        
        whenOk(eve(events.activating, app, section), function() {
            // get the current active section data
            var data = getSectionData(section);

            classtweak
                // remove the active flag from all of the sections
                ('section', '-p-active', element)

                // add the active section flag to the current section
                (section, '+p-active');
                
            // update the document title
            document.title = data.title || document.title;
                
            // update the history
            if (updateState && typeof history != 'undefined') {
                history.pushState(data, document.title, href);
            } // if
            
            // update the activate section variable
            activeSection = section;
        });
        
        return true;
    } // activate
    
    function data(key, value) {
        if (typeof value == 'undefined') {
            return this.storage[name];
        }
        else {
            // update the storage value
            storage[name] = {
                value: value,
                updated: new Date().getTime()
            };

            // trigger a data update
            eve(events.data, app, key, value);

            // return the reference to the app
            return app;
        } // if..else
    } // data
    
    app = {
        activate: activate,
        data: data
    };
    
    // initialise the pager
    init();
  
    // return the app
    return app;
};