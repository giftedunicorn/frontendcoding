## 介绍

在前端面试中，除了要了解前端知识（八股文），还需要熟练算法题。但是有别于后端面试，前端的算法中还会让你手写一些常用的前端接口，比如手写bind，手写reduce，手写new等等。

刚开始感觉很无语，写这些简直是浪费感情，但是面试多了发现各家面试官都会问这种问题。而且有一定的规律和套路，经常问来问去就那几个问题。不像leetcode，都已经堆到2000+题了。所以今天分享一下我收集的和总结的前端面试手写代码算法题。

# 1. 实现一个深克隆 deepClone

需要实现一个深克隆函数，可以对JS的对象进行深克隆，避免克隆后的对象引用原来的对象。普通版本只要考虑对象中的String和Number就可以了，但是有的进阶版本会让你考虑Date，循环引用，和正则表达等类型。

```js
const deepClone = function(obj, map = new Map()) {
  if (!obj) return obj
  if (map.has(obj)) { // 判断是否循环引用
    return map.get(obj) 
  }

  let newObj
  if (Object.prototype.toString.call(obj) == "[object Object]") {
    newObj = {}
    map.set(obj, newObj);
    for (let key in obj) {
      let val = obj[key]
      newObj[key] = deepClone(val, map)
    }
  } else if (Object.prototype.toString.call(obj) == "[object Array]") {
    newObj = []
    map.set(obj, newObj);
    for (let key in obj) {
      let val = obj[key]
      newObj[key] = deepClone(val, map)
    }
  } else if (Object.prototype.toString.call(obj) == "[object Function]") {
    newObj = obj.clone() 
  } else if (obj.constructor === Object.prototype.toString.call(obj) == "[object Date]") {
    newObj = new Date(obj)
  } else {
    newObj = obj
  }

  return newObj
}
console.log(deepClone(1)) // 1
console.log(deepClone(null)) // null
console.log(deepClone(undefined)) // undefined
console.log(deepClone([1, 2, 3]))
console.log(deepClone({ a: new Date(), b: null, c: 123, d: [1,2,3] }))
const a = {
  b: {
    c: null,
  },
};
a.b.c = a;
console.log(deepClone(a))
```

# 2. 实现一个防抖函数 debounce

实现一个防抖函数，触发事件后n秒后才能执行函数，如果在n秒内触发了事件，则会重新计算执行时间。防抖的重点在于清零。在一系列相同的操作后只执行一次。使用场景有：

1.  避免用户登录，发送短信按钮点击太快
2.  调整浏览器窗口大小事，避免resize次数过多
3.  文本编辑器实时保存，任何更改操作之后，最后才会保存
4.  搜索框输入，只在用户最后一次输入完，才执行搜索请求

```js
const debounce = function(fn, timeout = 300) {
  let timer = null

  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, timeout)
  }
}
function saveInput(id){
  console.log('Saving data', id);
}
const testDebounce = debounce((id) => saveInput(id));
setInterval(() => {
  testDebounce(12)
}, 250)

```

# 3. 实现一个节流函数 throttle

实现一个节流函数，连续触发事件但是在n秒中只执行一次函数。即不管你在指定时间内触发多少次函数，但是它只执行一次事件。节流在于加锁，和服务器的rate limiter相似。使用场景有：

1.  scroll滚动事件每隔一秒计算一次位置
2.  浏览器播放事件，每隔一秒计算一次进度信息
3.  input搜索展示下拉列表，每隔1秒发送一次请求

```js
const throttle = function(fn, timeout = 500) {
  let waiting = false

  return function(...args) {
    if (waiting) return
    waiting = true
    fn.apply(this, args)
    setTimeout(() => {
      waiting = false
    }, timeout)
  }
}
function saveInput(id){
  console.log('Saving data', id);
}
const testThrottle = throttle((id) => saveInput(id));
setInterval(() => {
  testThrottle(15)
}, 250)
```

# 4. 手写 promise all

手写一个类似 Promise.all 的方法，全部异步任务完成后，一起返回。

```js
const promiseAll = function(inputs) {
  return new Promise((resolve, reject) => {
    let length = inputs.length
    let count = 0
    let data = []
    for (let fn of inputs) {
      fn.apply(this)
      .then((res) => {
        count++
        data.push(res)
        if (count === length) resolve(data)
      }).catch((err) => {
        reject(err)
      })
    }
  })
}
const request = function(id) {
  return new Promise((resolve, reject) => {
     let timeout = Math.floor(Math.random() * 1000) + 500
       setTimeout(() => {
           resolve(`${id}: ${timeout}ms`);
       }, timeout);
  })
}
let inputs = []
for (let i = 0; i < 22; i++) {
  inputs.push(() => request(i))
}
promiseAll(inputs)
.then((res) => {
  console.log('promiseAll', res)
})
```

# 5. 手写 promise race

手写一个类似 Promise.race 的方法，返回第一个异步结果

```js
const promiseRace = function(inputs) {
  return new Promise((resolve, reject) => {
    for (let fn of inputs) {
      fn.apply(this)
      .then((res) => {
        resolve(res)
      }).catch((err) => {
        reject(err)
      })
    }
  })
}
promiseRace(inputs)
.then((res) => {
  console.log('promiseRace', res)
})
```

# 6. 实现 promise scheduler

手写一个Promise并发的控制器。假设需要执行N个异步任务，这个控制器可以并发执行M个异步任务，不能同时执行超过M个任务，执行完一个任务再继续执行下一个，直到全部执行完毕。

```js
const Scheduler = function(max = 3) {
  let currentJobs = 0
  let queue = []

  function start() {
    if (queue.length === 0 || currentJobs >= max) return

    currentJobs++
    let [fn, resolve, reject] = queue.shift()
    fn.apply(this).then((res) => {
      currentJobs--
      start()
      resolve(res)
    }).catch((err) => {
      currentJobs--
      start()
      reject(err)
    })
  }

  return function(fn) {
    return new Promise((resolve, reject) => {
      queue.push([fn, resolve, reject])
      start()
    })
  }
}
const scheduler = Scheduler(6)
const request = function(id) {
  return new Promise((resolve, reject) => {
     let timeout = Math.floor(Math.random() * 1000) + 500
       setTimeout(() => {
           resolve(`${id}: ${timeout}ms`);
       }, timeout);
  })
}
for (let i = 0; i < 25; i++) {
  scheduler(() => request(i))
    .then((res) => {
    console.log('scheduler', res)
  })
}
```

# 7. 手写 my reduce

手写一个类似 Array.reduce 的方法

```js
Array.prototype.myReduce = function(fn, initialValue) {
  let nums = this
  let res = 0
  if (initialValue) res = initialValue

  for (let i = 0; i < nums.length; i++) {
    res = fn(res, nums[i])
  }

  return res
}
let arr = [1,2,3,4,3,1]
let myReduceRes = arr.myReduce((a, b) => {
  return a + b
})
let reduceRes = arr.reduce((a, b) => {
  return a + b
})
console.log('myReduce', myReduceRes)
console.log('reduce', reduceRes)
```

# 8. 手写 my AJAX 

手写一个AJAX，其实就是如何使用 XMLHttpRequest

```js
function ajax(method, url, body = {}) {
  return new Promise((resolve, reject) => {
    // 0. create XMLHttpRequest instance
    let xhr = new XMLHttpRequest()
    // 1. define request
    xhr.open(method, url, true)
    // xhr.setRequestHeader("Content-Type", "application/json");
    // 2. define response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let res = xhr.response
        resolve(res)
      } else {
        reject()
      }
    }
    // 3. define error
    xhr.onerror = () => {
      reject()
    }
    // 4. send request
    xhr.send() // get
    // xhr.send(body) // post
  })
}
ajax('GET', 'https://ipv4.icanhazip.com/')
.then((res) => {
  console.log(res)
})
```

# 9. 手写 my instanceof

手写一个 instanceof 函数，涉及到原型链的知识。

```js
const myInstanceof = function(original, target) {
  let proto = original.__proto__
  while (proto) {
    if (proto === target.prototype) {
      return true
    }
    proto = proto.__proto__
  }

  return false
}
const myInstanceofTest = [1,2,3]
console.log(myInstanceof(myInstanceofTest, Array));  // true
console.log(myInstanceof(myInstanceofTest, Object));  // true
console.log(myInstanceof(myInstanceofTest, Function));  // false
```

# 10. 手写 my typeof

手写一个 typeof 的函数。typeof 本身对 Array 和 Object 都分不清，所以尽量使用 Object.prototype.toString.apply，在其它面试问题的时候，也尽量使用这个。

```js
const myTypeof = function(target) {
  let type = Object.prototype.toString.apply(target) // 万能查询类型方法
  type = type.split(' ')[1]
  return type.slice(0, -1).toLowerCase()
}
console.log(myTypeof({}))
console.log(myTypeof([]))
console.log(myTypeof(Function))
console.log(myTypeof(123))
console.log(myTypeof(null))
console.log(myTypeof(''))
console.log(myTypeof(new Date()))
```

# 11. 手写 my new

手写一个 new 函数，涉及到JS class和继承的知识

```js
const myNew = function(fn, ...args) {
  let context = Object.create(fn.prototype)
  let res = fn.apply(context, args)
  // 如果 res 是 undeinfed 或者，没有返回的东西，则返回 context
  if (res instanceof Object) {
    return res
  } else {
    return context
  }
}
function Person(name, age) {
  this.name = name;
  this.age = age;
}
const person = myNew(Person, 'fl', 32)
console.log(person)
```

# 12. 手写 my call

手写一个 call 函数

```js
Function.prototype.myCall = function(context, ...args) {
  let obj = context || window
  obj.fn = this
  let res = obj.fn(...args)
  delete obj.fn
  return res
}

```

# 13. 手写 my apply

手写一个 apply 函数，和 call 几乎一样，只是参数不一样。

```js
Function.prototype.myApply = function(context, arr) {
  // 定义 this，上下文
  let obj = context || window
  // 函数放进上下文的fn中
  obj.fn = this
  // 执行 fn，这样做fn就可以看到context了，闭包
  let res = obj.fn(...arr)
  // 要删除 fn
  delete obj.fn
  return res
}
const obj = {
  name: 'alex'
}
const myApplyTestFn = function(a, b) {
  console.log(a,b)
  console.log(this.name)
}
console.log('myCall', myApplyTestFn.myCall(obj, 1,2))
console.log('myApply', myApplyTestFn.myApply(obj, [1,2]))
```

# 14. 手写 my bind

手写一个 bind 函数，和 call 和 apply 不一样的是 bind 会返回一个函数。

```js
Function.prototype.myBind = function(context) {
  const fn = this
  const args = [...arguments].slice(1)

  return function(...innerArgs) {
    let moreArgs = [...args, ...innerArgs]
    return fn.apply(context, moreArgs)
  }
}
const context = {
  name: 'alex'
}
const myBindTestFn = function(name, age, school){
  console.log(name) // 'Ann'
  console.log(age) // 32
  console.log(school) // '126'
}
let myBindFn = myBindTestFn.myBind(context, 'Ann')
myBindFn(32, '126')
```

# 15. 手写 my trim

手写一个 trim 方法

```js
String.prototype.myTrim = function() {
  let str = this
  const trimLeft = function(string) {
    for (let i = 0; i < string.length; i++) {
      if (string.charAt(i) !== ' ') {
        return string.substring(i, string.length)
      }
    }

    return string
  }

  const trimRight = function(string) {
    for (let i = string.length - 1; i >= 0; i--) {
      if (string.charAt(i) !== ' ') {
        return string.substring(0, i + 1)
      }
    }

    return string
  }

  return trimRight(trimLeft(str))
}
console.log('        123123123    '.myTrim())
```

# 16. 手写 my curry

手写函数柯里化。柯里化函数接会接收一部分参数，返回一个函数接收剩余参数，接收足够参数后，执行原函数。

```js
const myCurry = function(fn) {
  // fn.length gives the length of arguments of fn
  let length = fn.length
  // get arguments from myCurry
  let args = [...arguments].slice(1)

  return function(...innerArgs) {
    // concat myCurry and currying arguments
    let moreArgs = [...args, ...innerArgs]
    // if current length === fn.length, we can return the result
    if (length === moreArgs.length) return fn.apply(this, moreArgs)
    // if not yet finished, recursion and call myCurry.apply with the correct arguments
    else return myCurry.apply(this, [fn, ...moreArgs])
  }
}
function sum(a, b, c) {
  return a + b + c;
}
let currying = myCurry(sum)
console.log(currying(1)(2)(3))
console.log(currying(1,2,3))
```

# 17. 手写 my promise

手写一个promise，关键在于定义收集回调函数的栈，定义resolve函数和reject函数。可能有的面试会要求promise支持链式调用，需要注意。

```js
class MyPromise {
  constructor(fn) {
    // Only allow to call resolve or reject once. If resolve or reject is executed, 
    // the promise is done and not allow to call resolve or reject again
    this.state = 'pending'
    // save for later, execute cb in stack when resolving or rejecting
    this.successfullStack = []
    this.failureStack = []

    // we should use arrow function here, using normal function will make this undeinfed
    const resolve = (res) => {
      // if promise is finished (not pending state), not continue and return
      if (this.state === 'pending') this.state = 'success'
      else return

      // execute callback one by one
      this.successfullStack.forEach((next) => {
        const nextRes = next[0].apply(this, [res])
        next[1](nextRes)
      })
    }

    const reject = (res) => {
      // if promise is finished (not pending state), not continue and return
      if (this.state === 'pending') this.state = 'fail'
      else return

      this.failureStack.forEach((cb) => {
        cb.apply(this, [res])
      })
    }

    fn(resolve, reject)
  }

  then(cb) {
    // chaining promise 链式调用
    // create a new promise and return this promise
    // push callback, resolve and reject to the stack
    return new MyPromise((resolve, reject) => {
      this.successfullStack.push([cb, resolve, reject])
    })
  }

  catch(cb) {
    this.failureStack.push(cb)
    return this
  }
}
const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(123);
  }, 2000);
});
promise1.then(res => {
  console.log('DONE 1', res); // 过两秒输出123
  return 111
}).then((res) => {
  console.log('DONE 2', res); // 过两秒输出111
  return 222
}).then((res) => {
  console.log('DONE 3', res); // 过两秒输出222
  return 333
}).then((res) => {
  console.log('DONE 4', res); // 过两秒输出333
}).catch(err => {
  console.log('ERROR', err);
})
```

# 18. 实现 json to string

手写一个类似 JSON.stringify 的方法，递归的形式生成字符串。

```js
const jsonToString = function(obj) {
  if (!obj) return obj
  let str = ``

  if (Object.prototype.toString.call(obj) === '[object Array]') {
    str = `[`
    let keys = Object.keys(obj)
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j]
      let val = obj[key]
      let res = jsonToString(val)
      str = `${str}${res}`
      if (j !== keys.length - 1) str = `${str},` // remove the last comma
    }
    str = `${str}]`
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
    str = `{`
    let keys = Object.keys(obj)
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j]
      let val = obj[key]
      let res = jsonToString(val)
      str = `${str}"${key}":${res}`
      if (j !== keys.length - 1) str = `${str},` // remove the last comma
    }
    str = `${str}}`
  } else {
    // other than array or object
    return `${obj}`
  }

  return str
}
let jsonToStringTest = {
    a: 11,
    b: {
        b: 22,
        c: {
            D: 33,
            e: [44,55,66]
        }
    }
};
console.log(JSON.stringify(jsonToStringTest))
console.log(jsonToString(jsonToStringTest))
```

# 19. 实现 string to json

实现一个类似 JSON.parse 的方法

```js
const jsonString = '{ "age": 20, "name": "jack" }'
const stringToJson = function(jsonString) {
  return (new Function('return ' + jsonString))();
}
console.log(stringToJson(jsonString))
```

# 20. 实现 dom to json

就是 React 把真实DOM转换成虚拟DOM

```js
// DOM2JSON
/*
<div>
  <span>
    <a></a>
  </span>
  <span>
    <a></a>
    <a></a>
  </span>
</div>
把上诉dom结构转成下面的JSON格式
{
  tag: 'DIV',
  children: [
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [] },
        { tag: 'A', children: [] }
      ]
    }
  ]
}
*/
const dom2json = function(domTree) {
  // create an obj
  let obj = {}
  // get the tag name
  obj.tag = domTree.tagName
  // setup array for children
  obj.children = []
  // iterate each child node
  domTree.childNodes.forEach((child) => {
    // dfs, it will return json of this child
    obj.children.push(dom2json(child))
  })
  return obj
}
```

# 21. 实现 json to dom

就是 React 把虚拟DOM转换成真实DOM

```js
// const vdom = {
//   tag: 'DIV',
//   attrs:{
//   id:'app'
//   },
//   children: [
//     {
//       tag: 'SPAN',
//       children: [
//         { tag: 'A', children: [] }
//       ]
//     },
//     {
//       tag: 'SPAN',
//       children: [
//         { tag: 'A', children: [] },
//         { tag: 'A', children: [] }
//       ]
//     }
//   ]
// }
/*
把上诉虚拟Dom转化成下方真实Dom
<div id="app">
  <span>
    <a></a>
  </span>
  <span>
    <a></a>
    <a></a>
  </span>
</div>
*/
const vdomToRdom = function(vdom) {
  let tag = vdom.tag.toLowerCase()
  let dom = document.createElement(tag)

  if (vdom.attrs) {
    for (let key in vdom.attrs) {
      let val = vdom.attrs[key]
      dom.setAttribute(key, val)
    }
  }

  for (let child of vdom.children) {
    let childNode = vdomToRdom(child)
    dom.appendChild(childNode)
  }

  return dom
}
console.log(vdomToRdom(vdom))
```

# 22. 实现 tree to list

把一个树转化成list

```js
const treeToList = function(tree) {
  let list = []
  treeToListHelper(tree, list)
  list.sort((a,b) =>a.id-b.id)
  return list
}
const treeToListHelper = function(tree, list) {
  if (!tree) return

  for (let item of tree) {
    let id = item.id
    let name = item.name
    let parentId = item.parentId
    list.push({ id, name, parentId })
    treeToListHelper(item.children, list)
  }
}
let tree = [
  {
    id: 1,
    name: '部门A',
    parentId: 0,
    children: [
      {
        id: 3,
        name: '部门C',
        parentId: 1,
        children: [
          {
            id: 6,
            name: '部门F',
            parentId: 3
          }
        ]
      },
      {
        id: 4,
        name: '部门D',
        parentId: 1,
        children: [
          {
            id: 8,
            name: '部门H',
            parentId: 4
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '部门B',
    parentId: 0,
    children: [
      {
        id: 5,
        name: '部门E',
        parentId: 2
      },
      {
        id: 7,
        name: '部门G',
        parentId: 2
      }
    ]
  }  
];
console.log(treeToList(tree))
```

# 23. 实现 list to tree

把list转换成树结构

```js
const listToTree = function(list) {
  let map = new Map()
  for (let item of list) {
    let name = item.name
    let id = item.id
    let parentId = item.parentId
    let children = map.get(parentId) || []
    children.push({id, name, parentId})
    map.set(parentId, children)
  }

  return appendChildren(0, map)
}
const appendChildren = function(parentId, map) {
   let children = map.get(parentId)
   if (!children) return null
   for (let child of children) {
     let res = appendChildren(child.id, map)
     if (res) child.children = res
   }

   return children
}
let list = [
  {id:1, name:'部门A', parentId:0},
  {id:2, name:'部门B', parentId:0},
  {id:3, name:'部门C', parentId:1},
  {id:4, name:'部门D', parentId:1},
  {id:5, name:'部门E', parentId:2},
  {id:6, name:'部门F', parentId:3},
  {id:7, name:'部门G', parentId:2},
  {id:8, name:'部门H', parentId:4}
];
console.log(listToTree(list))
```

# 24. 实现 path to object

手写一个可以转换 path 数组到对象的方法

```js
const pathToObjData = {
  'a.b': 1,
  'a.c': 2,
  'a.d.e': 5,
  'c': 3
}
/* 
返回结果
{ a: { b: 1, c: 2, d: { e: 5 } }, c: 3 }
*/
const pathToObj = function(pathList) {
  let res = {}
  for (let path in pathList) {
    let pathArr = path.split('.')
    pathToObjHelper(pathArr, pathList[path], res)
  }
  return res
}
const pathToObjHelper = function(pathArr, val, res) {
  if (pathArr.length === 0) {
    return val
  }

  let key = pathArr.shift()
  let obj = res[key] ? res[key] : {}
  res[key] = pathToObjHelper(pathArr, val, obj)

  return res
}
console.log(pathToObj(pathToObjData))

```

# 25. 实现 obj to path

手写一个可以转换对象到 path 数组的方法

```js
const objToPathData = {
  a: {
    b: 1,
    c: 2,
    d: {e: 5}
  },
  b: [1, 3, {a: 2, b: 3}],
  c: 3
} 
/* 
返回结果
{
  'a.b': 1,
  'a.c': 2,
  'a.d.e': 5,
  'b[0]': 1,
  'b[1]': 3,
  'b[2].a': 2,
  'b[2].b': 3,
  c: 3
}
*/
const objToPath = function(obj) {
  let res = {} 
  objToPathHelper(obj, '', res)
  return res
}
const objToPathHelper = function(obj, path, res) {
  if (!obj) return

  if (Array.isArray(obj)) {
    for (let key in obj) {
      const pathKey = path ? `${path}[${key}]` : `${path}${key}`
      objToPathHelper(obj[key], pathKey, res)
    }
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      const pathKey = path ? `${path}.${key}` : `${path}${key}`
      objToPathHelper(obj[key], pathKey, res)
    }
  } else {
    res[path] = obj
  }
}
console.log(objToPath(objToPathData))
```

# 26. 实现 flatten array

手写一个扁平化数组的方法

```js
const flattenArray = function(array) {
  return flattenArrayHelper(array)
}
const flattenArrayHelper = function(array) {
  let res = []

  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      res = res.concat(flattenArrayHelper(array[i]))
    } else {
      res.push(array[i])
    }
  }

  return res
}
console.log(flattenArray([12,[1,2,3],3,[2,4,[4,[3,4],2]]]));
```

# 27. 实现 dedup array

实现数组去重，可以使用Set去重，也可以尝试其它方法。

```js
const dedupArray = function(array) {
  new Set(array)
  return [...new Set(array)]
}
console.log(dedupArray([12, 1, 2, 3, 3, 2, 4, 4, 3, 4, 2]))
```

# 28. 实现大数相加

输入两个类型为字符串的数字，相加之后返回字符串结果。从后往前加，注意最后一个carry。

```js
function add(a ,b){
  let indexa = a.length - 1
  let indexb = b.length - 1
  let carry = 0
  let res = ``

  while (indexa >= 0 || indexb >= 0) {
    let numa = indexa >= 0 ? a.charAt(indexa) : 0
    let numb = indexb >= 0 ? b.charAt(indexb) : 0

    let sum = parseInt(numa) + parseInt(numb) + carry
    carry = sum >= 10 ? 1 : 0
    sum = sum >= 10 ? sum - 10 : sum
    res = `${sum}${res}`

    indexa--
    indexb--
  }
    
  // 最后如果剩下一个carry
  if (carry !== 0) {
    res = `1${res}`
  }

  return res
}
let a = "9007199254740991";
let b = "1234567899999999999";
console.log(add(a, b))
```

# 29. 抢红包

手写一个类似微信红包的方法。

```js
const redenvelope = function(people, amount) {
  let randSum = 0
  let randList = []
  let res = []

  for (let i = 0; i < people; i++) {
    let rand = Math.random()
    randList.push(rand)
    randSum += rand
  }

  randList.forEach((rand) => {
    res.push(amount * rand / randSum)
  })

  return res
}
const redenvelopeRes = redenvelope(13, 200)
console.log('redenvelopeRes', { redenvelopeRes, sum: redenvelopeRes.reduce((acc,val) => {
    return acc + val 
  })
})
```

# 30. 实现 LazyMan

实现一个LazyMan，可以按照以下方式调用:

```js
LazyMan(“Hank”)
输出 
Hi! This is Hank!

LazyMan(“Hank”).sleep(10).eat(“dinner”)
输出 
Hi! This is Hank!
等待10秒..
Wake up after 10
Eat dinner~

LazyMan(“Hank”).eat(“dinner”).eat(“supper”)
输出
Hi This is Hank!
Eat dinner~
Eat supper~

LazyMan(“Hank”).eat(“supper”).sleepFirst(5)
输出
等待5秒
Wake up after 5
Hi This is Hank!
Eat supper

class LazyMan {
  constructor(name) {
    this.tasks = []

    // 按照顺序推入task队列
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`Hi This is ${name}!`)
        this.next()
      }, 0)
    })

    // 关键不然不会执行，首次执行，但是希望在同步任务之后执行
    setTimeout(() => {
      this.next()
    }, 0)
  }

  // 每次执行完一个任务，执行next，来执行下一个任务
  next() {
    let task = this.tasks.shift()
    task && task()
  }

  sleep(sec) {
    // 按照顺序推入task队列
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`Wake up after ${sec}`)
        this.next()
      }, sec*1000)
    })

    // 返回this，继续执行lazy man的方法
    return this
  }

  eat(meal) {
    // 按照顺序推入task队列
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`Eat ${meal}~`)
        this.next()
      }, 0)
    })

    return this
  }

  sleepFirst(sec) {
    // 推入task首部执行
    this.tasks.unshift(() => {
      setTimeout(() => {
        console.log(`Wake up after ${sec}`)
        this.next()
      }, sec*1000)
    })

    return this
  }
}
new LazyMan("Hank")
new LazyMan("Hank").sleep(10).eat("dinner")
new LazyMan("Hank").eat("dinner").eat("supper")
new LazyMan("Hank").eat("supper").sleepFirst(5)
```

# 31. 每隔一秒打印一个数字，用setTimeout来实现

var 定义的变量在 for 循环之外是可以访问到的，也就是说，在执行 setTimeout 这个类似异步的操作之前，循环就已经结束了。这时的 i 已经为 10，所以最后打印出来的也就是 10 个 10 了。所以需要使用 let 替换 var 解决这个问题。

```js
const printNumber = function(n) {
  // print n, n times
  // for (var i = 0; i < n; i++) {
  //   setTimeout(() => {
  //     console.log(i)
  //   }, i * 1000)
  // }

  // print 0 to n - 1
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      console.log(i)
    }, i * 1000)
  }
}
printNumber(6)
```

# 32. 异步的执行顺序，看问题说答案

# 33. this的指向问题，看问题说答案

# 34. 排列 [['a', 'b'], ['n', 'm'], ['0', '1']] => ['an0', 'am0', 'an1', 'am1', 'bn0', 'bm0', 'bn1', 'bm0']

# 35. 版本号排序的方法，题目描述: 有一组版本号如下['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5']。现在需要对其进行排序，排序的结果为 [ '4.3.5', '4.3.4.5', '4.2', '2.3.3', '0.302.1', '0.1.1' ]

# 36. EventEmitter，题目描述: 实现一个发布订阅模式拥有 on emit once off 方法

# 37. 实现一个继承，最好是寄生组合继承

# 38. 题目描述: 渲染百万条结构简单的大数据时 怎么使用分片思想优化渲染

# 39. 写一个事件代理函数，需要判断child是parent的子节点

# 40. 给定一个不含重复数字的数组array, 指定个数n, 目标和sum, 判断是否含有由n个不同数字相加得到sum的情况, leetcode 40 变种, 数字不得重复使用

# 41. function request(urls, maxNumber, callback) 要求编写函数实现，根据urls数组内的url地址进行并发网络请求，最大并发数maxNumber，当所有请求完毕后调用callback函数(已知请求网络的方法可以使用fetch api)

# 42. 手写代码：写个单例模式

# 43. 请实现抽奖函数rand，保证随机性，输入为表示对象数组，对象有属性n表示人名，w表示权重，随机返回一个中奖人名，中奖概率和w成正比

# 44. 实现这个u, u.console('breakfast').setTimeout(3000).console('lunch').setTimeout(3000).console('dinner')

# 45. getPathValue({a:{b:[1,2,3]}}, 'a.b[0]') => 返回 1

# 46. 实现千分位格式化函数

# 47. 给数组中的字符串编号，f(['ab', 'c', 'd', 'ab', 'c']) => ['ab1', 'c1', 'd', 'ab2', 'c2']，写完后问了一下时间和空间复杂度。

# 48. 实现一个sum，执行asyncAdd

# 49. 实现一个object add函数
