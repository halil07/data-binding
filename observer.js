/* maps observable properties to a Set of
observer functions, which use the property */
const observers = new WeakMap()
let changedprop = null,
    oldVal = null,
    newVal = null;
/* points to the currently running 
observer function, can be undefined */
let currentObserver

/* this trap intercepts get operations,
it does nothing if no observer is executing
at the moment */
function get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver)
    if (currentObserver) {
        registerObserver(target, key, currentObserver)
    }
    return result
}


/* this trap intercepts set operations,
it queues every observer associated with the
currently set property to be executed later */
function set(target, key, value, receiver) {
    changedprop = key;
    newVal = value;
    oldVal = target[key];
    const observersForKey = observers.get(target).get(key)
    if (observersForKey) {
        observersForKey.forEach(queueObserver)
    }
    return Reflect.set(target, key, value, receiver)
}

/* transforms an object into an observable 
by wrapping it into a proxy, it also adds a blank
Map for property-observer pairs to be saved later */
function observable(obj) {
    observers.set(obj, new Map())
    return new Proxy(obj, {
        get,
        set
    })
}


/* if an observer function is running currently,
this function pairs the observer function 
with the currently fetched observable property
and saves them into the observers Map */
function registerObserver(target, key, observer) {
    let observersForKey = observers.get(target).get(key)
    if (!observersForKey) {
        observersForKey = new Set()
        observers.get(target).set(key, observersForKey)
    }
    observersForKey.add(observer)
}

/* contains the triggered observer functions,
which should run soon */
const queuedObservers = new Set()

/* the exposed observe function */
function observe(fn) {
    queueObserver(fn)
}

/* adds the observer to the queue and 
ensures that the queue will be executed soon */
function queueObserver(observer) {
    if (queuedObservers.size === 0) {
        Promise.resolve().then(runObservers)
    }
    queuedObservers.add(observer)
}

/* runs the queued observers,
currentObserver is set to undefined in the end */
function runObservers() {
    try {
        queuedObservers.forEach(runObserver)
    } finally {
        currentObserver = undefined
        queuedObservers.clear()
    }
}

/* sets the global currentObserver to observer, 
then executes it */
function runObserver(observer) {
    currentObserver = observer
    observer(changedprop, oldVal, newVal);
}