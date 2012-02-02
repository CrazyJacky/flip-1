// ┌──────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.3.4 - JavaScript Events Library                                                │ \\
// ├──────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
// │ Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license. │ \\
// └──────────────────────────────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.3.4",
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
                ce = current_event,
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
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
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
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eat)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catch)(1);
     * This will ensure that `catch` function will be called before `eat`.
     * If you want to put your handler before non-indexed handlers, specify a negative value.
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
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
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
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
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
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            var res = f.apply(this, arguments);
            eve.unbind(name, f2);
            return res;
        };
        return eve.on(name, f2);
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
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
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
    // if we don't have a splice function, then we don't have an array
    // make it one
    else if (! elements.splice) {
        elements = [elements];
    } // if..else

    // apply the requested action
    if (initAction) {
        tweak(initAction);
    } // if
    
    // return the tweak
    return initAction ? classtweak : tweak;
} // classtweak

/** @license MIT License (c) copyright B Cavalier & J Hann */

/**
 * when
 * A lightweight CommonJS Promises/A and when() implementation
 *
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @version 0.11.1
 */

(function(define) {
define(function() {
    var freeze, reduceArray, undef;

    /**
     * No-Op function used in method replacement
     * @private
     */
    function noop() {}

    /**
     * Allocate a new Array of size n
     * @private
     * @param n {number} size of new Array
     * @returns {Array}
     */
    function allocateArray(n) {
        return new Array(n);
    }
    
    /**
     * Use freeze if it exists
     * @function
     * @private
     */
    freeze = Object.freeze || function(o) { return o; };

    // ES5 reduce implementation if native not available
    // See: http://es5.github.com/#x15.4.4.21 as there are many
    // specifics and edge cases.
    reduceArray = [].reduce ||
        function(reduceFunc /*, initialValue */) {
            // ES5 dictates that reduce.length === 1

            // This implementation deviates from ES5 spec in the following ways:
            // 1. It does not check if reduceFunc is a Callable

            var arr, args, reduced, len, i;

            i = 0;
            arr = Object(this);
            len = arr.length >>> 0;
            args = arguments;

            // If no initialValue, use first item of array (we know length !== 0 here)
            // and adjust i to start at second item
            if(args.length <= 1) {
                // Skip to the first real element in the array
                for(;;) {
                    if(i in arr) {
                        reduced = arr[i++];
                        break;
                    }

                    // If we reached the end of the array without finding any real
                    // elements, it's a TypeError
                    if(++i >= len) {
                        throw new TypeError();
                    }
                }
            } else {
                // If initialValue provided, use it
                reduced = args[1];
            }

            // Do the actual reduce
            for(;i < len; ++i) {
                // Skip holes
                if(i in arr)
                    reduced = reduceFunc(reduced, arr[i], i, arr);
            }

            return reduced;
        };

    /**
     * Trusted Promise constructor.  A Promise created from this constructor is
     * a trusted when.js promise.  Any other duck-typed promise is considered
     * untrusted.
     */
    function Promise() {}

    /**
     * Creates a new, CommonJS compliant, Deferred with fully isolated
     * resolver and promise parts, either or both of which may be given out
     * safely to consumers.
     * The Deferred itself has the full API: resolve, reject, progress, and
     * then. The resolver has resolve, reject, and progress.  The promise
     * only has then.
     *
     * @memberOf when
     * @function
     *
     * @returns {Deferred}
     */
    function defer() {
        var deferred, promise, resolver, result, listeners, progressHandlers, _then, _progress, complete;

        listeners = [];
        progressHandlers = [];

        /**
         * Pre-resolution then() that adds the supplied callback, errback, and progback
         * functions to the registered listeners
         *
         * @private
         *
         * @param [callback] {Function} resolution handler
         * @param [errback] {Function} rejection handler
         * @param [progback] {Function} progress handler
         *
         * @throws {Error} if any argument is not null, undefined, or a Function
         */
        _then = function unresolvedThen(callback, errback, progback) {
            // Check parameters and fail immediately if any supplied parameter
            // is not null/undefined and is also not a function.
            // That is, any non-null/undefined parameter must be a function.
            var arg, deferred, i = arguments.length;
            while(i) {
                arg = arguments[--i];
                if (arg != null && typeof arg != 'function') throw new Error('callback is not a function');
            }

            deferred = defer();

            listeners.push({
                deferred: deferred,
                resolve: callback,
                reject: errback
            });

            progback && progressHandlers.push(progback);

            return deferred.promise;
        };

        /**
         * Registers a handler for this {@link Deferred}'s {@link Promise}.  Even though all arguments
         * are optional, each argument that *is* supplied must be null, undefined, or a Function.
         * Any other value will cause an Error to be thrown.
         *
         * @memberOf Promise
         *
         * @param [callback] {Function} resolution handler
         * @param [errback] {Function} rejection handler
         * @param [progback] {Function} progress handler
         *
         * @throws {Error} if any argument is not null, undefined, or a Function
         */
        function then(callback, errback, progback) {
            return _then(callback, errback, progback);
        }

        /**
         * Resolves this {@link Deferred}'s {@link Promise} with val as the
         * resolution value.
         *
         * @memberOf Resolver
         *
         * @param val anything
         */
        function resolve(val) {
            complete('resolve', val);
        }

        /**
         * Rejects this {@link Deferred}'s {@link Promise} with err as the
         * reason.
         *
         * @memberOf Resolver
         *
         * @param err anything
         */
        function reject(err) {
            complete('reject', err);
        }

        /**
         * @private
         * @param update
         */
        _progress = function(update) {
            var progress, i = 0;
            while (progress = progressHandlers[i++]) progress(update);
        };

        /**
         * Emits a progress update to all progress observers registered with
         * this {@link Deferred}'s {@link Promise}
         *
         * @memberOf Resolver
         *
         * @param update anything
         */
        function progress(update) {
            _progress(update);
        }

        /**
         * Transition from pre-resolution state to post-resolution state, notifying
         * all listeners of the resolution or rejection
         *
         * @private
         *
         * @param which {String} either "resolve" or "reject"
         * @param val anything resolution value or rejection reason
         */
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
                // TODO: Consider silently returning here so that parties who
                // have a reference to the resolver cannot tell that the promise
                // has been resolved using try/catch
                throw new Error("already completed");
            };

            // Free progressHandlers array since we'll never issue progress events
            // for this promise again now that it's completed
            progressHandlers = undef;

            // Final result of this Deferred.  This is immutable
            result = val;

            // Notify listeners
            notify(which);
        };

        /**
         * Notify all listeners of resolution or rejection
         *
         * @param which {String} either "resolve" or "reject"
         */
        function notify(which) {
            // Traverse all listeners registered directly with this Deferred,
            // also making sure to handle chained thens

            var listener, ldeferred, newResult, handler, localListeners, i = 0;

            // Reset the listeners array asap.  Some of the promise chains in the loop
            // below could run async, so need to ensure that no callers can corrupt
            // the array we're iterating over, but also need to allow callers to register
            // new listeners.
            localListeners = listeners;
            listeners = [];

            while (listener = localListeners[i++]) {

                ldeferred = listener.deferred;
                handler = listener[which];

                try {

                    newResult = handler ? handler(result) : result;

                    // NOTE: isPromise is also called by promise(), which is called by when(),
                    // resulting in 2 calls to isPromise here.  It's harmless, but need to
                    // refactor to avoid that.
                    if (isPromise(newResult)) {
                        // If the handler returned a promise, chained deferreds
                        // should complete only after that promise does.
                        when(newResult, ldeferred.resolve, ldeferred.reject, ldeferred.progress);

                    } else {
                        // Complete deferred from chained then()
                        // FIXME: Which is correct?
                        // The first always mutates the chained value, even if it is undefined
                        // The second will only mutate if newResult !== undefined
                        // ldeferred[which](newResult);
                        ldeferred[which](newResult === undef ? result : newResult);

                    }
                } catch (e) {
                    // Exceptions cause chained deferreds to reject
                    ldeferred.reject(e);
                }
            }
        }

        /**
         * The full Deferred object, with both {@link Promise} and {@link Resolver}
         * parts
         * @class Deferred
         * @name Deferred
         * @augments Resolver
         * @augments Promise
         */
        deferred = {};

        // Promise and Resolver parts
        // Freeze Promise and Resolver APIs

        /**
         * The Promise API
         * @namespace Promise
         * @name Promise
         */
        promise = new Promise();
        promise.then = deferred.then = then;
        
        /**
         * The {@link Promise} for this {@link Deferred}
         * @memberOf Deferred
         * @name promise
         * @type {Promise}
         */
        deferred.promise = freeze(promise);

        /**
         * The Resolver API
         * @namespace Resolver
         * @name Resolver
         */
        resolver =
        /**
         * The {@link Resolver} for this {@link Deferred}
         * @memberOf Deferred
         * @name resolver
         * @type {Resolver}
         */
            deferred.resolver = freeze({
                resolve:  (deferred.resolve  = resolve),
                reject:   (deferred.reject   = reject),
                progress: (deferred.progress = progress)
            });

        return deferred;
    }

    /**
     * Determines if promiseOrValue is a promise or not.  Uses the feature
     * test from http://wiki.commonjs.org/wiki/Promises/A to determine if
     * promiseOrValue is a promise.
     *
     * @param promiseOrValue anything
     *
     * @returns {Boolean} true if promiseOrValue is a {@link Promise}
     */
    function isPromise(promiseOrValue) {
        return promiseOrValue && typeof promiseOrValue.then === 'function';
    }

    /**
     * Register an observer for a promise or immediate value.
     *
     * @function
     * @name when
     * @namespace
     *
     * @param promiseOrValue anything
     * @param {Function} [callback] callback to be called when promiseOrValue is
     *   successfully resolved.  If promiseOrValue is an immediate value, callback
     *   will be invoked immediately.
     * @param {Function} [errback] callback to be called when promiseOrValue is
     *   rejected.
     * @param {Function} [progressHandler] callback to be called when progress updates
     *   are issued for promiseOrValue.
     *
     * @returns {Promise} a new {@link Promise} that will complete with the return
     *   value of callback or errback or the completion value of promiseOrValue if
     *   callback and/or errback is not supplied.
     */
    function when(promiseOrValue, callback, errback, progressHandler) {
        // Get a promise for the input promiseOrValue
        // See promise()
        var trustedPromise = promise(promiseOrValue);

        // Register promise handlers
        return trustedPromise.then(callback, errback, progressHandler);
    }

    /**
     * Returns promiseOrValue if promiseOrValue is a {@link Promise}, a new Promise if
     * promiseOrValue is a foreign promise, or a new, already-resolved {@link Promise}
     * whose resolution value is promiseOrValue if promiseOrValue is an immediate value.
     *
     * Note that this function is not safe to export since it will return its
     * input when promiseOrValue is a {@link Promise}
     *
     * @private
     *
     * @param promiseOrValue anything
     *
     * @returns Guaranteed to return a trusted Promise.  If promiseOrValue is a when.js {@link Promise}
     *   returns promiseOrValue, otherwise, returns a new, already-resolved, when.js {@link Promise}
     *   whose resolution value is:
     *   * the resolution value of promiseOrValue if it's a foreign promise, or
     *   * promiseOrValue if it's a value
     */
    function promise(promiseOrValue) {
        var promise, deferred;

        if(promiseOrValue instanceof Promise) {
            // It's a when.js promise, so we trust it
            promise = promiseOrValue;

        } else {
            // It's not a when.js promise.  Check to see if it's a foreign promise
            // or a value.
            deferred = defer();

            if(isPromise(promiseOrValue)) {
                // It's a compliant promise, but we don't know where it came from,
                // so we don't trust its implementation entirely.  Introduce a trusted
                // middleman when.js promise

                // IMPORTANT: This is the only place when.js should ever call .then() on
                // an untrusted promise.
                promiseOrValue.then(deferred.resolve, deferred.reject, deferred.progress);

            } else {
                // It's a value, not a promise.  Create an already-resolved promise
                // for it.
                deferred.resolve(promiseOrValue);

            }

            promise = deferred.promise;
        }

        return promise;
    }

    /**
     * Return a promise that will resolve when howMany of the supplied promisesOrValues
     * have resolved. The resolution value of the returned promise will be an array of
     * length howMany containing the resolutions values of the triggering promisesOrValues.
     *
     * @memberOf when
     *
     * @param promisesOrValues {Array} array of anything, may contain a mix
     *      of {@link Promise}s and values
     * @param howMany
     * @param [callback]
     * @param [errback]
     * @param [progressHandler]
     *
     * @returns {Promise}
     */
    function some(promisesOrValues, howMany, callback, errback, progressHandler) {
        var toResolve, results, ret, deferred, resolver, rejecter, handleProgress, len, i;

        len = promisesOrValues.length >>> 0;

        toResolve = Math.max(0, Math.min(howMany, len));
        results = [];
        deferred = defer();
        ret = when(deferred, callback, errback, progressHandler);

        // Wrapper so that resolver can be replaced
        function resolve(val) {
            resolver(val);
        }

        // Wrapper so that rejecter can be replaced
        function reject(err) {
            rejecter(err);
        }

        // Wrapper so that progress can be replaced
        function progress(update) {
            handleProgress(update);
        }

        function complete() {
            resolver = rejecter = handleProgress = noop;
        }

        // No items in the input, resolve immediately
        if (!toResolve) {
            deferred.resolve(results);

        } else {
            // Resolver for promises.  Captures the value and resolves
            // the returned promise when toResolve reaches zero.
            // Overwrites resolver var with a noop once promise has
            // be resolved to cover case where n < promises.length
            resolver = function(val) {
                // This orders the values based on promise resolution order
                // Another strategy would be to use the original position of
                // the corresponding promise.
                results.push(val);

                if (!--toResolve) {
                    complete();
                    deferred.resolve(results);
                }
            };

            // Rejecter for promises.  Rejects returned promise
            // immediately, and overwrites rejecter var with a noop
            // once promise to cover case where n < promises.length.
            // TODO: Consider rejecting only when N (or promises.length - N?)
            // promises have been rejected instead of only one?
            rejecter = function(err) {
                complete();
                deferred.reject(err);
            };

            handleProgress = deferred.progress;

            // TODO: Replace while with forEach
            for(i = 0; i < len; ++i) {
                if(i in promisesOrValues) {
                    when(promisesOrValues[i], resolve, reject, progress);
                }
            }
        }

        return ret;
    }

    /**
     * Return a promise that will resolve only once all the supplied promisesOrValues
     * have resolved. The resolution value of the returned promise will be an array
     * containing the resolution values of each of the promisesOrValues.
     *
     * @memberOf when
     *
     * @param promisesOrValues {Array} array of anything, may contain a mix
     *      of {@link Promise}s and values
     * @param [callback] {Function}
     * @param [errback] {Function}
     * @param [progressHandler] {Function}
     *
     * @returns {Promise}
     */
    function all(promisesOrValues, callback, errback, progressHandler) {
        var results, promise;

        results = allocateArray(promisesOrValues.length);
        promise = reduce(promisesOrValues, reduceIntoArray, results);

        return when(promise, callback, errback, progressHandler);
    }

    function reduceIntoArray(current, val, i) {
        current[i] = val;
        return current;
    }

    /**
     * Return a promise that will resolve when any one of the supplied promisesOrValues
     * has resolved. The resolution value of the returned promise will be the resolution
     * value of the triggering promiseOrValue.
     *
     * @memberOf when
     *
     * @param promisesOrValues {Array} array of anything, may contain a mix
     *      of {@link Promise}s and values
     * @param [callback] {Function}
     * @param [errback] {Function}
     * @param [progressHandler] {Function}
     *
     * @returns {Promise}
     */
    function any(promisesOrValues, callback, errback, progressHandler) {

        function unwrapSingleResult(val) {
            return callback(val[0]);
        }

        return some(promisesOrValues, 1, unwrapSingleResult, errback, progressHandler);
    }

    /**
     * Traditional map function, similar to `Array.prototype.map()`, but allows
     * input to contain {@link Promise}s and/or values, and mapFunc may return
     * either a value or a {@link Promise}
     *
     * @memberOf when
     *
     * @param promisesOrValues {Array} array of anything, may contain a mix
     *      of {@link Promise}s and values
     * @param mapFunc {Function} mapping function mapFunc(value) which may return
     *      either a {@link Promise} or value
     *
     * @returns {Promise} a {@link Promise} that will resolve to an array containing
     *      the mapped output values.
     */
    function map(promisesOrValues, mapFunc) {

        var results, i;

        // Since we know the resulting length, we can preallocate the results
        // array to avoid array expansions.
        i = promisesOrValues.length;
        results = allocateArray(i);

        // Since mapFunc may be async, get all invocations of it into flight
        // asap, and then use reduce() to collect all the results
        for(;i >= 0; --i) {
            if(i in promisesOrValues)
                results[i] = when(promisesOrValues[i], mapFunc);
        }

        // Could use all() here, but that would result in another array
        // being allocated, i.e. map() would end up allocating 2 arrays
        // of size len instead of just 1.  Since all() uses reduce()
        // anyway, avoid the additional allocation by calling reduce
        // directly.
        return reduce(results, reduceIntoArray, results);
    }

    /**
     * Traditional reduce function, similar to `Array.prototype.reduce()`, but
     * input may contain {@link Promise}s and/or values, but reduceFunc
     * may return either a value or a {@link Promise}, *and* initialValue may
     * be a {@link Promise} for the starting value.
     *
     * @memberOf when
     *
     * @param promisesOrValues {Array} array of anything, may contain a mix
     *      of {@link Promise}s and values
     * @param reduceFunc {Function} reduce function reduce(currentValue, nextValue, index, total),
     *      where total is the total number of items being reduced, and will be the same
     *      in each call to reduceFunc.
     * @param initialValue starting value, or a {@link Promise} for the starting value
     *
     * @returns {Promise} that will resolve to the final reduced value
     */
    function reduce(promisesOrValues, reduceFunc, initialValue) {

        var total, args;

        total = promisesOrValues.length;

        // Skip promisesOrValues, since it will be used as 'this' in the call
        // to the actual reduce engine below.

        // Wrap the supplied reduceFunc with one that handles promises and then
        // delegates to the supplied.

        args = [
            function (current, val, i) {
                return when(current, function (c) {
                    return when(val, function (value) {
                        return reduceFunc(c, value, i, total);
                    });
                });
            }
        ];

        if (arguments.length >= 3) args.push(initialValue);

        return promise(reduceArray.apply(promisesOrValues, args));
    }

    /**
     * Ensure that resolution of promiseOrValue will complete resolver with the completion
     * value of promiseOrValue, or instead with resolveValue if it is provided.
     *
     * @memberOf when
     *
     * @param promiseOrValue
     * @param resolver {Resolver}
     * @param [resolveValue] anything
     *
     * @returns {Promise}
     */
    function chain(promiseOrValue, resolver, resolveValue) {
        var useResolveValue = arguments.length > 2;

        return when(promiseOrValue,
            function(val) {
                resolver.resolve(useResolveValue ? resolveValue : val);
            },
            resolver.reject,
            resolver.progress
        );
    }

    //
    // Public API
    //

    when.defer     = defer;

    when.isPromise = isPromise;
    when.some      = some;
    when.all       = all;
    when.any       = any;

    when.reduce    = reduce;
    when.map       = map;

    when.chain     = chain;

    return when;
});
})(typeof define == 'function'
    ? define
    : function (factory) { typeof module != 'undefined'
        ? (module.exports = factory())
        : (this.when      = factory());
    }
    // Boilerplate for AMD, Node, and browser global
);



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


(function() {
    eve.on('flip.change', function(newpage, oldpage) {
        if (newpage && newpage.container && newpage.path) {
            $('.navbar a[href="' + newpage.path + '"]', newpage.container).each(function() {
                $(this).parent('li').siblings('li').removeClass('active');
                $(this).parent('li').addClass('active');
            });
        }
    });
})();

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
    
    eve.on('flip.change', function(newpage, oldpage) {
        if (oldpage && oldpage !== newpage) {
            classtweak(newpage.element, '+p-in -p-out');
            classtweak(oldpage.element, '-p-in +p-out');
        } // if
    });
})();
