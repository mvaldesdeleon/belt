const { iif, or } = require('./logic.js');
const { isArray, mapify, map, filter, push } = require('./list.js');
const { isPlainObject, listify, mapAny, mapplyO } = require('./map.js');
const { compose, flip } = require('./function.js');
const { pairWith, first, second } = require('./tuple.js');

const isPromise = x => x instanceof Promise;

const resolve = Promise.resolve.bind(Promise);

const reject = Promise.reject.bind(Promise);

const all = Promise.all.bind(Promise);

const allO = map => all(listify(map)).then(mapify);

const allAny = iif(isArray)(all)(allO);

const isTraversable = or(isPlainObject)(isArray);

const traverse = x => isTraversable(x) ? compose(allAny, mapAny(traverse))(x) : resolve(x);

const callbackify = fn => (...args) => (cb => fn(...args).then((...args) => cb(null, ...args), err => cb(err)))(args.pop());

const effectP = fn => x => fn(x).then(() => x);

const mapplyP = transformMap => data => traverse(mapplyO(transformMap)(data));

const then = fn => p => p.then(fn);

const filterP = prP => xs => resolve(xs).then(map(pairWith(prP))).then(traverse).then(filter(second)).then(map(first));

const seq = pfns => pfns.reduce((p, pfn) => p.then(([r, rs]) => pfn(r).then(pairWith(flip(push)(rs)))), resolve([undefined, []])).then(second);

const assert = pr => x => pr(x) ? resolve(x) : reject();

const assertE = (msg, pr) => x => pr(x) ? resolve(x) : reject(new Error(`Assertion failed: ${msg}`));

const assertP = pr => x => pr(x).then(res => res ? x : reject());

const assertPE = (msg, pr) => x => pr(x).then(res => res ? x : reject(new Error(`Assertion failed: ${msg}`)));

const composeP = (...pfns) => (...args) => (first => pfns.reduceRight((p, pfn) => p.then(pfn), first(...args)))(pfns.pop());

module.exports = {
    isPromise,
    resolve,
    reject,
    all,
    allO,
    allAny,
    traverse,
    callbackify,
    effectP,
    mapplyP,
    then,
    filterP,
    seq,
    assert,
    assertE,
    assertP,
    assertPE,
    composeP
};
