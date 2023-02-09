export function debounce(callback, wait, immediate) {
  let timeout;
  function debounced (...args) {
    window.clearTimeout(timeout);
    const callNow = immediate && !timeout
    timeout = window.setTimeout(() => {
      timeout = null;
      if (!immediate) callback.apply(this, args);
    }, wait);
    if (callNow) callback.apply(this, args);
  };
  return debounced;
}