// ┌──────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.3.2 - JavaScript Events Library                                                │ \\
// ├──────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
// │ Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license. │ \\
// └──────────────────────────────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.3.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]
     **
     * Fires event with given `name`, given scope and other parameters.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers
     **
     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            stop = oldstop;
                            return out;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                stop = oldstop;
                                return out;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        stop = oldstop;
                        return out;
                    }
                }
            }
            stop = oldstop;
            return out.length ? out : null;
        };
    /*\
     * eve.listeners
     [ method ]
     **
     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated
     **
     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accept one number parameter that represents z-index of the handler. It is optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eat)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catch)(1);
     * This will ensure that `catch` function will be called before `eat`.
     * If you want to put you hadler before not indexed handlers specify negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            !e[names[i]] && (e[names[i]] = {n: {}});
            e = e[names[i]];
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside event handler to stop event
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.unbind
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    eve.unbind = function (name, f) {
        var names = name.split(separator),
            e,
            key,
            splice,
            cur = [events];
        for (var i = 0, ii = names.length; i < ii; i++) {
            for (var j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (glob.eve = eve);
})(this);

function classtweak(elements, initAction, scope) {
    // if elements is not defined, then return
    if (! elements) {
        return undefined;
    } // if

    // internals
    var reSpaces = /[\s\,]+/,
        instructionHandlers = {
            '+': function(current, target, foundIdx) {
                // if the style was not found, then add it
                if (foundIdx < 0) {
                    current[current.length] = target;
                } // if
            },
            
            '-': function(current, target, foundIdx) {
                if (foundIdx >= 0) {
                    current.splice(foundIdx, 1);
                } // if
            },
            
            '!': function(current, target, foundIdx) {
                instructionHandlers[foundIdx < 0 ? '+' : '-'](current, target, foundIdx);
            }
        };
    
    function tweak(actions) {
        // itereate through the elements
        for (var elIdx = elements.length; elIdx--; ) {
            var element = elements[elIdx],
                activeClasses = element.className ? element.className.split(/\s+/).sort() : [],
                ii;

            // if the action is a string, then parse into an array
            if (typeof actions == 'string') {
                actions = actions.split(reSpaces);
            } // if

            // iterate through the actions and apply the tweaks
            for (ii = actions.length; ii--; ) {
                // get the action instruction
                var action = actions[ii],
                    instruction = action.slice(0, 1),
                    lastChar = action.slice(-1),
                    className = action.slice(1),
                    handler = instructionHandlers[instruction],
                    dotSyntax = instruction == '.' || lastChar == '.',
                    classIdx, found = -1;
                    
                // if the instruction handler is not found, then default to +
                // also, use the full action text
                if (! handler) {
                    // if we have the dot syntax then do more parsing
                    if (dotSyntax) {
                        // update the handler
                        handler = instructionHandlers[
                            instruction == '.' && lastChar == '.' ? '!' : 
                                instruction == '.' ? '+' : '-'
                        ];
                        
                        // update the classname
                        className = action.slice(
                            instruction == '.' ? 1 : 0, 
                            lastChar == '.' ? -1 : undefined
                        );
                    }
                    // otherwise, just fall back to the add handler
                    else {
                        // if the last character is a dot, push to the dot handler, otherwise +
                        handler = instructionHandlers['+'];
                        className = actions[ii];
                    } // if..else
                } // if
                
                // iterate through the active classes and update the found state
                for (classIdx = activeClasses.length; (found < 0) && classIdx--; ) {
                    // if we have a match on the class, then update the found index
                    if (activeClasses[classIdx] === className) {
                        found = classIdx;
                    } // if
                } // for

                // apply the handler, activeClasses modified in place
                handler(activeClasses, className, found);
            } // for

            // update the element classname
            element.className = activeClasses.join(' ');
        } // for
        
        return tweak;
    } // tweak
    
    // check the elements
    if (typeof elements == 'string' || elements instanceof String) {
        elements = (scope || document).querySelectorAll(elements);
    }
    else if (! Array.isArray(elements)) {
        elements = [elements];
    } // if..else

    // apply the requested action
    if (initAction) {
        tweak(initAction);
    } // if
    
    // return the tweak
    return initAction ? classtweak : tweak;
} // classtweak

/**
 * @license Copyright (c) 2011 Brian Cavalier
 * LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
 * to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
 */

//
// when.js 0.9.3
//
(function(define, undef) {
define([], function() {

	// No-op function used in function replacement in various
	// places below.
	function noop() {}

	// Use freeze if it exists
	var freeze = Object.freeze || noop;

	// Creates a new, CommonJS compliant, Deferred with fully isolated
	// resolver and promise parts, either or both of which may be given out
	// safely to consumers.
	// The Deferred itself has the full API: resolve, reject, progress, and
	// then. The resolver has resolve, reject, and progress.  The promise
	// only has then.
	function defer() {
		var deferred, promise, resolver, result, listeners, tail,
			_then, _progress, complete;

		_then = function(callback, errback, progback) {
			var d, listener;

			listener = {
				deferred: (d = defer()),
				resolve: callback,
				reject: errback,
				progress: progback
			};

			if(listeners) {
				// Append new listener if linked list already initialized
				tail = tail.next = listener;
			} else {
				// Init linked list
				listeners = tail = listener;
			}

			return d.promise;
		};

		function then(callback, errback, progback) {
			return _then(callback, errback, progback);
		}

		function resolve(val) {
			complete('resolve', val);
		}

		function reject(err) {
			complete('reject', err);
		}

		_progress = function(update) {
			var listener, progress;

			listener = listeners;

			while(listener) {
				progress = listener.progress;
				if(progress) progress(update);
				listener = listener.next;
			}
		};

		function progress(update) {
			_progress(update);
		}

		complete = function(which, val) {
			// Save original _then
			var origThen = _then;

			// Replace _then with one that immediately notifies
			// with the result.
			_then = function newThen(callback, errback) {
				var promise = origThen(callback, errback);
				notify(which);
				return promise;
			};

			// Replace complete so that this Deferred
			// can only be completed once.  Note that this leaves
			// notify() intact so that it can be used in the
			// rewritten _then above.
			// Replace _progress, so that subsequent attempts
			// to issue progress throw.
			complete = _progress = function alreadyCompleted() {
				throw new Error("already completed");
			};

			// Final result of this Deferred.  This is immutable
			result = val;

			// Notify listeners
			notify(which);
		};

        function notify(which) {
            // Traverse all listeners registered directly with this Deferred,
			// also making sure to handle chained thens
			while(listeners) {
				var listener, ldeferred, newResult, handler;

				listener  = listeners;
				ldeferred = listener.deferred;
				listeners = listeners.next;

				handler = listener[which];
				if(handler) {
					try {
						newResult = handler(result);

						if(isPromise(newResult)) {
							// If the handler returned a promise, chained deferreds
							// should complete only after that promise does.
							_chain(newResult, ldeferred);

						} else {
							// Complete deferred from chained then()
							// FIXME: Which is correct?
							// The first always mutates the chained value, even if it is undefined
							// The second will only mutate if newResult !== undefined
							// ldeferred[which](newResult);

							ldeferred[which](newResult === undef ? result : newResult);

						}
					} catch(e) {
						// Exceptions cause chained deferreds to complete
						// TODO: Should it *also* switch this promise's handlers to failed??
						// I think no.
						// which = 'reject';

						ldeferred.reject(e);
					}
				}
			}
		}

		// The full Deferred object, with both Promise and Resolver parts
		deferred = {};

		// Promise and Resolver parts

		// Expose Promise API
		promise = deferred.promise  = {
			then: (deferred.then = then)
		};

		// Expose Resolver API
		resolver = deferred.resolver = {
			resolve:  (deferred.resolve  = resolve),
			reject:   (deferred.reject   = reject),
			progress: (deferred.progress = progress)
		};

		// Freeze Promise and Resolver APIs
		freeze(promise);
		freeze(resolver);

		return deferred;
	}

	// Determines if promiseOrValue is a promise or not.  Uses the feature
	// test from http://wiki.commonjs.org/wiki/Promises/A to determine if
	// promiseOrValue is a promise.
	//
	// Parameters:
	// 	promiseOrValue - anything
	//
	// Return true if promiseOrValue is a promise.
	function isPromise(promiseOrValue) {
		return promiseOrValue && typeof promiseOrValue.then === 'function';
	}

	// Register a handler for a promise or immediate value
	//
	// Parameters:
	// 	promiseOrValue - anything
	//
	// Returns a new promise that will resolve:
	// 1. if promiseOrValue is a promise, when promiseOrValue resolves
	// 2. if promiseOrValue is a value, immediately
	function when(promiseOrValue, callback, errback, progressHandler) {
		var deferred, resolve, reject;

		deferred = defer();

		resolve = callback ? callback : function(val) { return val; };
		reject  = errback  ? errback  : function(err) { return err; };

		if(isPromise(promiseOrValue)) {
			// If it's a promise, ensure that deferred will complete when promiseOrValue
			// completes.
			promiseOrValue.then(resolve, reject,
				function(update) { progressHandler(update); }
			);
			_chain(promiseOrValue, deferred);

		} else {
			// If it's a value, resolve immediately
			deferred.resolve(resolve(promiseOrValue));

		}

		return deferred.promise;
	}

	// Return a promise that will resolve when howMany of the supplied promisesOrValues
	// have resolved. The resolution value of the returned promise will be an array of
	// length howMany containing the resolutions values of the triggering promisesOrValues.
	function some(promisesOrValues, howMany, callback, errback, progressHandler) {
		var toResolve, results, ret, deferred, resolver, rejecter, handleProgress;

		toResolve = Math.max(0, Math.min(howMany, promisesOrValues.length));
		results = [];
		deferred = defer();
		ret = (callback || errback || progressHandler)
			? deferred.then(callback, errback, progressHandler)
			: deferred.promise;

		// Resolver for promises.  Captures the value and resolves
		// the returned promise when toResolve reaches zero.
		// Overwrites resolver var with a noop once promise has
		// be resolved to cover case where n < promises.length
		resolver = function(val) {
			results.push(val);
			if(--toResolve === 0) {
				resolver = handleProgress = noop;
				deferred.resolve(results);
			}
		};

		// Wrapper so that resolver can be replaced
		function resolve(val) {
			resolver(val);
		}

		// Rejecter for promises.  Rejects returned promise
		// immediately, and overwrites rejecter var with a noop
		// once promise to cover case where n < promises.length.
		// TODO: Consider rejecting only when N (or promises.length - N?)
		// promises have been rejected instead of only one?
		rejecter = function(err) {
			rejecter = handleProgress = noop;
			deferred.reject(err);
		};

		// Wrapper so that rejecer can be replaced
		function reject(err) {
			rejecter(err);
		}

		handleProgress = function(update) {
			deferred.progress(update);
		};

		function progress(update) {
			handleProgress(update);
		}

		if(toResolve === 0) {
			deferred.resolve(results);
		} else {
			var promiseOrValue, i = 0;
			while((promiseOrValue = promisesOrValues[i++])) {
				when(promiseOrValue, resolve, reject, progress);
			}
		}

		return ret;
	}

	// Return a promise that will resolve only once all the supplied promisesOrValues
	// have resolved. The resolution value of the returned promise will be an array
	// containing the resolution values of each of the promisesOrValues.
	function all(promisesOrValues, callback, errback, progressHandler) {
		return some(promisesOrValues, promisesOrValues.length, callback, errback, progressHandler);
	}

	// Return a promise that will resolve when any one of the supplied promisesOrValues
	// has resolved. The resolution value of the returned promise will be the resolution
	// value of the triggering promiseOrValue.
	function any(promisesOrValues, callback, errback, progressHandler) {
		return some(promisesOrValues, 1, callback, errback, progressHandler);
	}

	// Ensure that resolution of promiseOrValue will complete resolver with the completion
	// value of promiseOrValue, or instead with optionalValue if it is provided.
	//
	// Parameters:
	// 	promiseOrValue - Promise, that when completed, will trigger completion of resolver,
	//      or value that will trigger immediate resolution of resolver
	// 	resolver - Resolver to complete when promise completes
	// 	resolveValue - optional value to use as the resolution value
	// 		used to resolve second, rather than the resolution
	// 		value of first.
	//
	// Returns a new promise that will complete when promiseOrValue is completed,
	// with the completion value of promiseOrValue, or instead with optionalValue if it
	// is provided.
	function chain(promiseOrValue, resolver, resolveValue) {
		var inputPromise, initChain;

		inputPromise = when(promiseOrValue);

		// Check against args length instead of resolvedValue === undefined, since
		// undefined may be a valid resolution value.
		initChain = arguments.length > 2
			? function(resolver) { return _chain(inputPromise, resolver, resolveValue) }
			: function(resolver) { return _chain(inputPromise, resolver); };

		// Setup chain to supplied resolver
		initChain(resolver);

		// Setup chain to new promise
		return initChain(when.defer()).promise;
	}

	// Internal chain helper that does not create a new deferred/promise
	// Always returns it's 2nd arg.
	// NOTE: deferred must be a when.js deferred, or a resolver whose functions
	// can be called without their original context.
	function _chain(promise, deferred, resolveValue) {
		promise.then(
			// If resolveValue was supplied, need to wrap up a new function
			// If not, can use deferred.resolve directly
			arguments.length > 2
				? function() { deferred.resolve(resolveValue) }
				: deferred.resolve,
			deferred.reject,
			deferred.progress
		);

		return deferred;
	}

	//
	// Public API
	//

	when.defer     = defer;

	when.isPromise = isPromise;
	when.some      = some;
	when.all       = all;
	when.any       = any;
	when.chain     = chain;

	return when;

}); // define
})(typeof define != 'undefined'
	// use define for AMD if available
	? define
	// If no define, look for module to export as a CommonJS module.
	// If no define or module, attach to current context.
	: typeof module != 'undefined'
		? function(deps, factory) { module.exports = factory(); }
		: function(deps, factory) { this.when = factory(); }
);


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


(function() {
    // if modernizr is not available, then abort
    if (typeof Modernizr != 'undefined') {
        // from the modernizr example
        var transEndEventNames = {
                'WebkitTransition' : 'webkitTransitionEnd',
                'MozTransition'    : 'transitionend',
                'OTransition'      : 'oTransitionEnd',
                'msTransition'     : 'msTransitionEnd', // maybe?
                'transition'       : 'transitionEnd'
            },
            transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

        window.addEventListener(transEndEventName, function(evt) {
            classtweak(evt.target, '-p-in -p-out');
        }, false);
    } // if
    
    eve.on('pager.change', function(newpage, oldpage) {
        if (oldpage) {
            classtweak(newpage.element, '+p-in -p-out');
            classtweak(oldpage.element, '-p-in +p-out');
        } // if
    });
})();
