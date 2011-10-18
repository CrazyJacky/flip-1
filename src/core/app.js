function App(element, opts) {
    // if the id is an object, then 
    if (typeof element == 'string' || element instanceof String) {
        element = document.querySelector('#' + element);
    } // if
    
    if ((! element) || (! element.querySelector)) {
        throw new Error('A containing element is required to create a new app');
    } // if
    
    // initialise opts
    opts = opts || {};
    opts.title = opts.title || 'Untitled App';
    
    // initialise the application storage
    this.container = element;
    this.id = element.id || ('mobicore-' + new Date().getTime()); 
    this.storage = {};
    
    // initialise the application
    this.init();
} // App

App.prototype.activate = function(section) {
    // remove the active flag from all of the sections
    classtweak('section', '-mc-active', this.container);
    
    // add the active section flag to the current section
    classtweak(section, '+mc-active');
}; // activate

App.prototype.data = function(name, value) {
    if (typeof value == 'undefined') {
        return this.storage[name];
    }
    else {
        // update the storage value
        this.storage[name] = {
            value: value,
            updated: new Date().getTime()
        };
        
        // trigger a data update
        eve('mobicore.appdata.' + name, this, value);
        
        // return the reference to the app
        return this;
    } // if..else
}; // data

App.prototype.init = function() {
    // look for the active section
    // TODO: make this terser
    var activeSection = this.container.querySelector('section.mc-active') || 
            this.container.querySelector('section[data-route="/"]') || 
            this.container.querySelector('section');

    this.activate(activeSection);
}; // init