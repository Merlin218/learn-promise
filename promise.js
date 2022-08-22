const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function Promise(executor) {
  let self = this;
  self.status = PENDING;
  self.onFulfilled = []; // 存放成功回调函数
  self.onRejected = []; // 存放失败回调函数

  function resolve(value) {
    if (value === this) {
      // 根据规范，抛出TypeError异常
      return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }

    if (value instanceof Promise) {
      return value.then(resolve, reject)
    }
    // 如果当前状态是pending，更改状态为fulfilled，并且执行成功回调函数
    if (self.status === PENDING) {
      self.status = FULFILLED;
      self.value = value;
      // 如果状态改变，按then的顺序执行回调函数
      self.onFulfilled.forEach(fn => fn(value));
    }
  }
  function reject(reason) {
    // 如果当前状态是pending，更改状态为rejected，并且执行失败回调函数
    if (self.status === PENDING) {
      self.status = REJECTED;
      self.reason = reason;
      // 如果状态改变，按then的顺序执行回调函数
      self.onRejected.forEach(fn => fn(reason));
    }
  }

  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  // onFullfilled为成功回调函数，onRejected为失败回调函数
  // 都是可选的
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
  let self = this;
  let promise2 = new Promise((resolve, reject) => {
    const fulfilledCallback = () => {
      // 必须是异步的，使用setTimeout模拟
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    }

    const rejectedCallback = () => {
      // 必须是异步的，使用setTimeout模拟
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    }

    if (self.status === FULFILLED) {
      // 如果当前状态是fulfilled，调用 onFulfilled，参数是promise的value
      fulfilledCallback();
    } else if (self.status === REJECTED) {
      // 如果当前状态是rejected，调用 onRejected，参数是promise的reason
      rejectedCallback();
    } else if (self.status === PENDING) {
      // 如果当前状态是pending，将成功回调函数和失败回调函数存放到数组中
      self.onFulfilled.push(fulfilledCallback);
      self.onRejected.push(rejectedCallback);
    }
  })
  return promise2;
}

function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
  }
  if (x && typeof x === 'object' || typeof x === 'function') {
    let used;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (used) return;
          used = true;
          resolvePromise(promise2, y, resolve, reject);
        }, (r) => {
          if (used) return;
          used = true;
          reject(r);
        })
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (e) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

module.exports = Promise;
