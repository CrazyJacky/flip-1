function Route(url, flipper, element) {
    var sourceData = element.dataset, key,
        section;
    
    // ensure the url is valid
    if (url === '' || url === '/') {
        url = 'home';
    } // if
    
    // if we don't have dataset data, then look through the attributes
    if (! sourceData) {
        sourceData = {};
        
        // get the state for the section
        for (key in element.attributes) {
            if (reValidAttr.test(key)) {
                sourceData[RegExp.$1] = element.attributes[key];
            } // if
        } // for
    } // if
    
    // copy the source data to the actual data
    this.data = {};
    for (key in sourceData) {
        this.data[key] = sourceData[key];
    }
    
    // initialise the url
    this.url = url;
    this.regex = new RegExp('^' + url);
    this.element = element;
    
    // create the page name for the element
    this.pageName = _urlToPageName(url);
    
    // save a reference to the flipper
    this.flipper = flipper;

    // make an event handler that flags this route as being handled
    this.flipper.on('flip.to.' + this.pageName, function() {
        return true;
    });
}

