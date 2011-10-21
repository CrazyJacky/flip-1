var Pager = function(element, opts) {
    // initialise opts
    opts = opts || {};
    opts.title = opts.title || 'Untitled App';
    
    /* internals */
    
    var app,
        activeSection,
        events = {
            activating: 'pager.activating',
            change: 'pager.change',
            init: 'pager.init'
        };
        
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
    
    function handleTap(evt) {
        var target = evt.target || evt.srcElement;

        // if we have a text node, then iterate up the tree
        while (target instanceof Text) {
            target = target.parentNode;
        } // while
        
        if (isRoute(target)) {
            evt.preventDefault();
        } // if
    } // eventChainer
        
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
        element.addEventListener('touchstart', handleTap, false);
        element.addEventListener('click', handleTap, false);
        
        // add the container class to the container element
        classtweak(element, '+p-container');
        
        // if the element is the document body, then add to the html element also
        if (element === document.body) {
            classtweak(element.parentNode, '+p-container');
        } // if
        
        // trigger the init event
        eve(events.init, app, element);

        // look for the active section
        firstElement = element.querySelector('section.p-active') || 
            element.querySelector('section[data-route="/"]') || 
            element.querySelector('section');
            
        // activate the first selected element
        activate(firstElement);
        
        // add the container class to the container element
        setTimeout(function() {
            classtweak(element, '+p-ready');
        }, 10);
    } // init
    
    function initRoutable(routable) {
        var url = routable.getAttribute('data-route');
        
        // ensure the url is valid
        if (url === '' || url === '/') {
            url = 'home';
        } // if
        
        // register the event handler
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
            var path = target ? target.getAttribute('href') || 'home' : '',
                routeResults = eve(path, app, target.href);

            for (var ii = 0; routeResults && ii < routeResults.length; ii++) {
                routed = routed || routeResults[ii];
            } // for
        } // if
        
        return routed;
    } // isRoutable
    
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
        
        // set the section margin top to offset it's position on the page
        // section.style['margin-top'] = '-' + section.offsetTop + 'px';
        
        whenOk(eve(events.activating, app, section, activeSection), function() {
            // get the current active section data
            var data = getSectionData(section);

            classtweak
                // remove the active flag from all of the sections
                ('section', '-p-active', element)

                // add the active section flag to the current section
                (section, '+p-active');
                
            // update the document title
            document.title = data.title || document.title;
                
            // update the activate section variable
            activeSection = section;

            // trigger the activated event
            eve(events.change, app, section, data, href);
        });
        
        return true;
    } // activate
    
    app = {
        activate: activate
    };
    
    // initialise the pager
    init();
  
    // return the app
    return app;
};