var Flipper = function(element, opts) {
    // initialise opts
    opts = opts || {};
    opts.title = opts.title || 'Untitled App';
    
    /* internals */
    
    var app,
        activeSection,
        events = {
            activating: 'flip.activating',
            change: 'flip.change',
            init: 'flip.init'
        },
        promises = [],
        reValidAttr = /^data\-/i,
        reLeadingHash = /^\#/,
        routables = [];
        
    function getDefaultSection() {
        var defaultElement = element.querySelector('.p-active') || 
            element.querySelector('[data-route="/"]') || 
            element.querySelector('section') ||
            element.querySelector('.flipper .section');
        
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
        var target = evt.target || evt.srcElement,
            routeData;

        // if we have a text node, then iterate up the tree
        while (target instanceof Text) {
            target = target.parentNode;
        } // while
        
        // get the route for the target
        routeData = isRoute(target);
        
        // if we have a path, then activate the path and prevent the default action
        if (routeData.route) {
            evt.preventDefault();

            if ((!activeSection) || (activeSection.path !== routeData.path)) {
                activate(routeData.path, evt);
            }
        }
    } // eventChainer
        
    function init() {
        var key, routables, ii, firstElement, target;
        
        // if the id is an object, then 
        if (typeof element == 'string' || element instanceof String) {
            element = document.querySelector('#' + element.replace(reLeadingHash, ''));
        } // if
        
        // default to the document body if the element isn't specified
        element = element || document.body;

        // if the element has an id, then include the events in the key
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
        
        // find the event target
        target = opts.multi ? element : document.body;
        
        // bind event handlers
        target.addEventListener('touchstart', handleTap, false);
        target.addEventListener('click', handleTap, false);
        
        // add the container class to the container element
        classtweak(element, '+flipper');
        
        // if the element is the document body, then add to the html element also
        if (element === document.body) {
            classtweak(element.parentNode, '+flipper');
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
            path: url,
            regex: new RegExp('^' + url),
            element: routable,
            container: element
        });
        
        // register the event handler
        eve.on(url + (element.id ? '.' + element.id : ''), function() {
            return this === app;
        });
    } // initRoutes
    
    function isRoute(target) {
        var route = false,
            path, routeResults;
        
        if (target && target.href) {
            // determine the path
            path = target ? target.getAttribute('href') || 'home' : '';
            
            // if we have an active section, and the path matches the target path, then we have routed
            route = activeSection && activeSection.path === path;
            
            // if this isn't a match for the current path, check if anything matches
            if (! route) {
                // check the route results (can we proceed?)
                routeResults = eve(path + (element.id ? '.' + element.id : ''), app, target.href);

                // reset the promises
                promises = [];

                // update the routed state
                route = routeResults && routeResults.length;

                for (var ii = 0; route && ii < routeResults.length; ii++) {
                    if (typeof routeResults[ii] != 'undefined') {
                        // update the routed flag
                        route = route && routeResults[ii];

                        // add to the list of current promises
                        promises.push(routeResults[ii]);
                    } // if
                } // for
            }
        } // if
        
        return {
            route: route,
            path: path
        };
    } // isRoutable
    
    function sizeContainer(sectionEl) {
        // update the container height
        // element.style.height = sectionEl.offsetHeight + 'px';
        
        /*
        TODO: size width to take into account padding...
        sectionEl.style.width = (element.clientWidth - 
            Math.max(sectionEl.offsetWidth - element.clientWidth, 0)) + 'px'; 
        */
    }
    
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
    
    function activate(path, sourceEvent) {
        // get the current active section data
        var section = getSection(path) || getDefaultSection(),
            data = section.data || {};
        
        if (section && section.element) {
            // initialise update state to a valid value
            // updateState = typeof updateState == 'undefined' || updateState;

            // set the section margin top to offset it's position on the page
            // section.style['margin-top'] = '-' + section.offsetTop + 'px';

            whenOk(eve(events.activating, app, section, activeSection, sourceEvent), function() {
                classtweak
                    // remove the active flag from all of the sections
                    ('section, .section', '-p-active', element)

                    // add the active section flag to the current section
                    (section.element, '+p-active');

                // update the document title
                document.title = data.title || document.title;

                // trigger the activated event
                eve(events.change, app, section, activeSection, sourceEvent);
                
                // update the container height to fit the page
                sizeContainer(section.element);

                // update the activate section variable
                activeSection = section;
            });
        }
    } // activate
    
    app = {
        activate: activate
    };
    
    // initialise the flipper
    init();
  
    // return the app
    return app;
};