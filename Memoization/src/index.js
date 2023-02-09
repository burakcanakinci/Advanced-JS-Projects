// Memoize

const defaultResolver = (...args) => JSON.stringify(args);

export function memoize(fn, resolver = defaultResolver) {
  const cache = new Map();
  const memoized = (...args) => {
    const key = resolver(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  memoized.clear = () => cache.clear();
  memoized.delete = (...args) => {
    const key = resolver(...args);
    cache.delete(key);
  };
  memoized.has = (...args) => {
    const key = resolver(...args);
    return cache.has(key);
  }
  return memoized;
}

// export function memoize(fn) {
//   const cache = new Map();
  
//   const memoized = (...args) => {
//     const key = JSON.stringify(args);

//     if (cache.has(key)) {
//       return cache.get(key);
//     }

//     const result = fn(...args);
//     cache.set(key, result);

//     return result;
//   };
//   // memoized.has = () => if (cache.has(key)) {
//   //   return cache.get(key);
//   // };
//   memoized.clear = () => memoized.cache.clear();
//   // memoized.delete = () => memo.delete();
//   return memoized;
// }


// get all the arguments and "stringify" them to build the key of the cache object
// verify if the key exists in the cache.
// If it does
// return the output value
// if it doesn't
// call the function
// store the output value in the cache
// and return the output value

