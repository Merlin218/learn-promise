# 手写Promise 

## Promise A+ 测试

```bash
# 安装测试库
pnpm i promise-aplus-tests
```

```js
// 在文件中加入以下代码
Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

module.exports = Promise;
```

```bash
# 运行测试库
promise-aplus-tests promise.js
```

## Promise 手写实现

📢 注意：
- then中调用`onFulfilled`和`onRejected`是异步执行的，在代码中使用`setTimeout`模拟。
- self.onFulfilled 和 self.onRejected 中存储了成功的回调和失败的回调，需要按顺序执行。
- 在 resolvePromise 的函数中，我们使用used来保证resolve和reject只执行其中一个，且只执行一次。
