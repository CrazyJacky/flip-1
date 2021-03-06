function Flipper(element, opts) {
    // initialise opts
    opts = opts || {};
    opts.title = opts.title || 'Untitled App';
    
    // if the id is an object, then 
    if (typeof element == 'string' || element instanceof String) {
        element = qsa('#' + element.replace(reLeadingHash, ''))[0];
    } // if
    
    // default to the document body if the element isn't specified
    this.element = element || document.body;
    this.id = this.element.id || ('flipper_' + new Date().getTime());

    // initialise routing information
    this.routes = [];
    this.activeRoute = null;
    this.defaultRoute = null;
    
    // initialise the events
    this.events = {
        activating: 'flip.activating',
        changed: 'flip.changed',
        init: 'flip.init'
    };
    
    // initialise
    this.init();
}

Flipper.prototype.activate = function(route, promises, sourceEvent) {
    var flipper = this,
        activated,
        activationPromises = [];
    
    // if the route is a string, then look for the route that matches
    if (typeof route == 'string' || route instanceof String) {
        route = this.findRoute(route);
    }
    
    if (route && route.element) {
        // initialise update state to a valid value
        // updateState = typeof updateState == 'undefined' || updateState;

        // set the section margin top to offset it's position on the page
        // section.style['margin-top'] = '-' + section.offsetTop + 'px';

        when.all(promises || [], function() {
            // remove the active flag from all of the sections
            classtweak('.flip-active', '-flip-active', flipper.element);

            // fire the activating event and check the result
            // in the same way as the flip.to events 
            activated = _eventPass(
                eve(flipper.events.activating, flipper, route, flipper.activeRoute, sourceEvent),
                activationPromises
            );
            
            // if (and once) activation is successful, continue
            when.all([activated].concat(activationPromises), function() {
                // make the new section active
                classtweak(route.element, '+flip-active');

                // update the document title
                // document.title = data.title || document.title;

                // trigger the activated event
                eve(flipper.events.changed, flipper, route, flipper.activeRoute, sourceEvent);

                // update the activate section variable
                flipper.activeRoute = route;
            });
        });
    }
};

Flipper.prototype.findRoute = function(url) {
    // iterate through the routables and look for a matching route
    for (var ii = 0; ii < this.routes.length; ii++) {
        if (this.routes[ii].regex.test(url)) {
            return this.routes[ii];
        } // if
    } // for
    
    return undefined;
};

Flipper.prototype.init = function() {
    var flipper = this,
        key, elements, ii,
        handleTap = _makeTapHandler(this),
        defaultElement;
    
    // if the element has an id, then include the events in the key
    if (this.element.id) {
        for (key in this.events) {
            this.events[key] += '.' + this.element.id;
        } // for
    } // if
    
    // add the container class to the container element
    classtweak(this.element, '+flipper');
    
    // find the routable elements
    elements = qsa('*[data-route]', this.element);
    
    // iterate through the routables and defined handlers
    for (ii = 0; ii < elements.length; ii++) {
        this.routes.push(new Route(elements[ii].getAttribute('data-route'), this, elements[ii]));
    } // for
    
    // bind event handlers
    this.element.addEventListener('touchstart', handleTap, false);
    this.element.addEventListener('click', handleTap, false);
    
    /*
    // if the element is the document body, then add to the html element also
    if (element === document.body) {
        classtweak(element.parentNode, '+flipper');
    } // if
    */
    
    // look for a default element
    defaultElement = qsa('.flip-active', this.element).concat(
        qsa('[data-route="/"]', this.element), 
        qsa('section, .section', this.element))[0];
        
    // if we have default element, then create a default route
    if (defaultElement) {
        var route = defaultElement.getAttribute('data-route');
        this.defaultRoute = route ? new Route(route, this, defaultElement) : null;
    }
    
    // trigger the init event
    eve(this.events.init, this, this.element);

    // activate the first selected element
    this.activate(this.defaultRoute);
    
    // add the container class to the container element
    setTimeout(function() {
        classtweak(flipper.element, '+flip-ready');
    }, 10);
};

Flipper.prototype.isRoute = function(target, sourceEvent) {
    var valid = false,
        path, routeResults, eventName,
        route = this.activeRoute,
        promises = [];
    
    if (target && target.href) {
        // determine the path
        path = _getTargetUrl(target);
        eventName = 'flip.to.' + _urlToPageName(path) + '.' + this.id;
        
        // if we have an active section, and the path matches the target path, then we have routed
        valid = route && route.path === path;
        
        // if this isn't a match for the current path, check if anything matches
        if (! valid) {
            // get the route
            route = this.findRoute(path);
            
            // check the route results (can we proceed?)
            // TODO: consider firing the flip.to event regardless
            routeResults = route ? eve(eventName, this, route, this.activeRoute, sourceEvent) : null;

            // check event validity
            valid = _eventPass(routeResults, promises);
        }
    } // if
    
    return {
        valid: valid,
        route: route,
        promises: promises
    };    
};

Flipper.prototype.on = function(evtName, handler) {
    eve.on(evtName + '.' + this.id, handler);
};