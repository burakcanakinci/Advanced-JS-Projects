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
