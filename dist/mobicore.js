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
    return tweak;
} // classtweak


var Mobicore = (function() {
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

    

    
    /* internals */
    
    function mapToEve(eventName) {
        return function() {
            eve.apply(eve, [eventName].concat(Array.prototype.slice.call(arguments, 0)));
        };
    } // mapToEve

    window.addEventListener('load', mapToEve('mobicore.load.doc'), false);
    
    return {
        App: App
    };
})();
