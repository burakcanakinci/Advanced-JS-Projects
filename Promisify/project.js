

// export function promisify(func) {
//   return function() {
//     return new Promise((resolve, reject) => {
//       try {
//         func(resolve);
//       } catch(e) {
//         reject(e);
//       }
//     })
//   }
// }

// const promisified = promisify(getFruits);
// promisified().then(res => console.log(res));

export function promisify(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      function callback(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
      args.push(callback);
      func.call(this, ...args); 
    });
  };
}