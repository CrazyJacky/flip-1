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
        storage = {};
        
    function init() {
        // if the id is an object, then 
        if (typeof element == 'string' || element instanceof String) {
            element = document.querySelector('#' + element);
        } // if

        if ((! element) || (! element.querySelector)) {
            throw new Error('A containing element is required to create a new app');
        } // if

        // ensure the element has an id
        if (element.id) {
            for (var key in events) {
                events[key] += '.' + element.id;
            } // for
        } // if

        // look for the active section
        // TODO: make this terser
        activate(
            element.querySelector('section.p-active') || 
            element.querySelector('section[data-route="/"]') || 
            element.querySelector('section')
        );
    } // init
    
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
            if (typeof eveResults[ii] != 'undefined') {
                promises.push(eveResults[ii]);
            } // if
        } // for
        
        // if the results are ok, then process
        if (ok) {
            when.all(promises, callback);
        } // if
    } // whenOk
    
    /* exports */
    
    function activate(section) {
        whenOk(eve(events.activating, app, section), function() {
            classtweak
                // remove the active flag from all of the sections
                ('section', '-p-active', element)

                // add the active section flag to the current section
                (section, '+p-active');

            // update the activate section variable
            activeSection = section;
        });
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