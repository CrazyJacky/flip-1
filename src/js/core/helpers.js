var reTrailingExtension = /\.\w+$/,
    reLeadingDot = /^\./,
    reLeadingHash = /^\#/,
    convertedUrls = {},
    reValidAttr = /^data\-(.*)$/i;
    
function _eventPass(results, promises) {
    // mark the route as valid if we have route results
    var valid = results && results.length;

    // now do a more detailed check of those results
    for (var ii = 0; valid && ii < results.length; ii++) {
        if (typeof results[ii] != 'undefined') {
            // update the routed flag
            valid = valid && results[ii];

            // add to the list of current promises
            promises.push(results[ii]);
        } // if
    } // for
    
    return valid;
}
    
function _getTargetUrl(target) {
    return target.getAttribute('href') || 'home';
}

function _urlToPageName(url) {
    if (! convertedUrls[url]) {
        convertedUrls[url] = url
            // strip the url extension
            .replace(reTrailingExtension, '')
            // replace slashes with dots
            .replace(/\//g, '.')
            // strip the leading dot
            .replace(reLeadingDot, '');
    }
    
    return convertedUrls[url];
} // _urlToPageName

function _makeTapHandler(flipper) {
    return function(evt) {
        var target = evt.target || evt.srcElement,
            routeData;

        // if we have a text node, then iterate up the tree
        while (target && typeof target.href == 'undefined') {
            target = target.parentNode;
        } // while
        
        // get the route for the target
        routeData = flipper.isRoute(target, evt);
        
        // if we have a path, then activate the path and prevent the default action
        if (routeData.valid) {
            evt.preventDefault();
            
            // activate the specified route
            flipper.activate(routeData.route, routeData.promises);
        }
    };
} // _makeTapHandler

/**
The `whenOk` function is used to parse results from triggering an eve event
and determining whether the event has handled ok.  If an event returns undefined,
true or a function then the results may be ok.
*/
function _whenOk(eveResults, promises, callback, errback) {
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