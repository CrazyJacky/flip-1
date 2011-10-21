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
        },
        promises = [],
        reValidAttr = /^data\-/i,
        routables = [];
        
    function getDefaultSection() {
        var defaultElement = element.querySelector('section.p-active') || 
            element.querySelector('section[data-route="/"]') || 
            element.querySelector('section');
        
        return {
            data: {},
            element: defaultElement
        };
    } // getDefaultSection
        
    function getSection(url) {
        // iterate through the routables and look for a matching route
        for (var ii = 0; ii < routables.length; ii++) {
            if (routables[ii].regex.test(url)) {
                return routables[ii];
            } // if
        } // for
        
        return undefined;
    } // getSection
        
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

        // activate the first selected element
        activate();
        
        // add the container class to the container element
        setTimeout(function() {
            classtweak(element, '+p-ready');
        }, 10);
    } // init
    
    function initRoutable(routable) {
        var url = routable.getAttribute('data-route'),
            data = {}, sourceData = routable.dataset, key,
            section;
        
        // ensure the url is valid
        if (url === '' || url === '/') {
            url = 'home';
        } // if
        
        // if we don't have dataset data, then look through the attributes
        if (! sourceData) {
            sourceData = routable.attribiutes;
        } // if
        
        // get the state for the section
        for (key in sourceData) {
            if ((! reValidAttr) || reValidAttr.test(key)) {
                data[key] = sourceData[key];
            } // if
        } // for
        
        // if we have an element id, then add the app id
        if (element.id) {
            data.appid = element.id;
        } // if

        // add to the routable data
        routables.push(section = {
            data: data,
            regex: new RegExp('^' + url),
            element: routable
        });
        
        // register the event handler
        eve.on(url + (element.id ? '.' + element.id : ''), function() {
            return this === app;
        });
    } // initRoutes
    
    function isRoute(target) {
        var routed = false;
        
        if (target && target.href) {
            var path = target ? target.getAttribute('href') || 'home' : '',
                routeResults = eve(path + (element.id ? '.' + element.id : ''), app, target.href);
                
            // reset the promises
            promises = [];

            // update the routed state
            routed = routeResults && routeResults.length;

            for (var ii = 0; routed && ii < routeResults.length; ii++) {
                if (typeof routeResults[ii] != 'undefined') {
                    // update the routed flag
                    routed = routed && routeResults[ii];
                    
                    // add to the list of current promises
                    promises.push(routeResults[ii]);
                } // if
            } // for
            
            if (routed) {
                activate(path);
            } // if
        } // if
        
        return routed;
    } // isRoutable
    
    /**
    The `whenOk` function is used to parse results from triggering an eve event
    and determining whether the event has handled ok.  If an event returns undefined,
    true or a function then the results may be ok.
    */
    function whenOk(eveResults, callback, errback) {
        var ok = true;
            
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
            when.all([].concat(promises), callback, errback);
        } // if
    } // whenOk
    
    /* exports */
    
    function activate(path) {
        // get the current active section data
        var section = getSection(path) || getDefaultSection(),
            data = section.data || {};
        
        if (section && section.element) {
            // initialise update state to a valid value
            // updateState = typeof updateState == 'undefined' || updateState;

            // set the section margin top to offset it's position on the page
            // section.style['margin-top'] = '-' + section.offsetTop + 'px';

            whenOk(eve(events.activating, app, section, activeSection), function() {
                classtweak
                    // remove the active flag from all of the sections
                    ('section', '-p-active', element)

                    // add the active section flag to the current section
                    (section.element, '+p-active');

                // update the document title
                document.title = data.title || document.title;

                // trigger the activated event
                eve(events.change, app, section, activeSection);
                
                // update the container height to fit the page
                element.style.height = section.element.getBoundingClientRect().height + 'px';

                // update the activate section variable
                activeSection = section;
            });
        }
    } // activate
    
    app = {
        activate: activate
    };
    
    // initialise the pager
    init();
  
    // return the app
    return app;
};