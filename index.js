// deep clone
const deepClone = function(obj) {
  if (!obj) return obj

  let newObj = Array.isArray ? [] : {}
  for (let key in obj) {
    let val = obj[key]
    if (typeof val === 'object') {
      newObj[key] = deepClone(val)
    } else {
      newObj[key] = val
    }
  }

  return newObj
}
const target = {
  name: 'ABC',
  key: null,
  age: 28,
  bool: false,
  address: {
    street: 'Station Road',
    city: 'Pune',
    number: 123,
  },
  keys: [1,2,3,4]
}
console.log(deepClone(target))

// deep clone for circle and date and function
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
Function.prototype.clone = function() {
  var newfun = new Function('return ' + this.toString())();
  for (var key in this)
    newfun[key] = this[key];
  return newfun;
};
const isDate = function(date) {
  return date instanceof Date
  // if (Object.prototype.toString.call(date) === "[object Date]") {
  //   return true
  // }
  // return false
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

// debounce
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

// throttle
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

// promise all
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

// promise race
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

// promise schedule
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

// my reduce
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

// my AJAX 
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

// my instanceof
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

// my typeof
const myTypeof = function(target) {
  let type = Object.prototype.toString.apply(target)
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

// my new
const myNew = function(fn, ...args) {
  let context = Object.create(fn.prototype)
  let res = fn.apply(context, args)
  // if res is undefined and nothing to return, return context
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

// my call
Function.prototype.myCall = function(context, ...args) {
  let obj = context || window
  obj.fn = this
  let res = obj.fn(...args)
  delete obj.fn
  return res
}

// my apply
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

// my bind
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

// json to string
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
      if (j !== keys.length - 1) str = `${str},` // remove the last ,
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
      if (j !== keys.length - 1) str = `${str},` // remove the last ,
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

// my trim
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

// my curry
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

// tree to list
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

// list to tree
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

// flatten array
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

// dedup array
const dedupArray = function(array) {
  new Set(array)
  return [...new Set(array)]
}
console.log(dedupArray([12, 1, 2, 3, 3, 2, 4, 4, 3, 4, 2]))

// 大数相加
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

  if (carry !== 0) {
    res = `1${res}`
  }

  return res
}
let a = "9007199254740991";
let b = "1234567899999999999";
console.log(add(a, b))

// path to obj
const pathToObjData = {
  'a.b': 1,
  'a.c': 2,
  'a.d.e': 5,
  'b[0]': 1,
  'b[1]': 3,
  'b[2].a': 2,
  'b[2].b': 3,
  'c': 3
}
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

// obj to path
const objToPathData = {
  a: {
    b: 1,
    c: 2,
    d: {e: 5}
  },
  b: [1, 3, {a: 2, b: 3}],
  c: 3
} 
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

// string to json
const jsonString = '{ "age": 20, "name": "jack" }'
const stringToJson = function(jsonString) {
  return (new Function('return ' + jsonString))();
}
console.log(stringToJson(jsonString))

// 分红包
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

// vdom to rdom
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

// LazyMan
/*
实现一个LazyMan，可以按照以下方式调用:
LazyMan(“Hank”)输出:
Hi! This is Hank!

LazyMan(“Hank”).sleep(10).eat(“dinner”)输出
Hi! This is Hank!
//等待10秒..
Wake up after 10
Eat dinner~

LazyMan(“Hank”).eat(“dinner”).eat(“supper”)输出
Hi This is Hank!
Eat dinner~
Eat supper~

LazyMan(“Hank”).eat(“supper”).sleepFirst(5)输出
//等待5秒
Wake up after 5
Hi This is Hank!
Eat supper
*/
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

// 每个一秒打印一个数字，用setTimeout来实现
const printNumber = function(n) {
  // print n, n times
  for (var i = 0; i < n; i++) {
    setTimeout(() => {
      console.log(i)
    }, i * 1000)
  }

  // print 0 to n - 1, n times
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      console.log(i)
    }, i * 1000)
  }
}
printNumber(6)

// this的指向问题，看题目说答案
var length = 10;
function fn() {
  return this.length + 1;
}
var obj1 = {
  length: 5,
  test1: function() {
    return fn()
  }
}

obj1.test2 = fn;
console.log(obj1.test1.call()) // 11
console.log(obj1.test1()) // 11
console.log(obj1.test2.call()) // 11
console.log(obj1.test2()) // 6

var name = "window";
var person = {
  name: "person",
  sayName: function () {
    console.log(this.name);
  }
};
function sayName() {
  var sss = person.sayName;
  sss(); // window
  person.sayName(); // person
  (person.sayName)(); // person
  (b = person.sayName)(); // window
}
sayName();

var name = 'window'
var person1 = {
  name: 'person1',
  foo1: function () {
    console.log(this.name)
  },
  foo2: () => console.log(this.name),
  foo3: function () {
    return function () {
      console.log(this.name)
    }
  },
  foo4: function () {
    return () => {
      console.log(this.name)
    }
  }
}
var person2 = { name: 'person2' }

// 隐式绑定，肯定是person1
person1.foo1(); // person1
// 隐式绑定和显示绑定的结合，显示绑定生效，所以是person2
person1.foo1.call(person2); // person2

// foo2()是一个箭头函数，不适用所有的规则
person1.foo2() // window
// foo2依然是箭头函数，不适用于显示绑定的规则
person1.foo2.call(person2) // window

// 获取到foo3，但是调用位置是全局作用于下，所以是默认绑定window
person1.foo3()() // window
// foo3显示绑定到person2中，但是拿到的返回函数依然是在全局下调用，所以依然是window
person1.foo3.call(person2)() // window
// 拿到foo3返回的函数，通过显示绑定到person2中，所以是person2
person1.foo3().call(person2) // person2

// foo4()的函数返回的是一个箭头函数，箭头函数的执行找上层作用域，是person1
person1.foo4()() // person1
// foo4()显示绑定到person2中，并且返回一个箭头函数，箭头函数找上层作用域，是person2
person1.foo4.call(person2)() // person2
// foo4返回的是箭头函数，箭头函数只看上层作用域
person1.foo4().call(person2) // person1

var name = 'window'
function Person (name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
  },
  this.foo2 = () => console.log(this.name),
  this.foo3 = function () {
    return function () {
      console.log(this.name)
    }
  },
  this.foo4 = function () {
    return () => {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

// 隐式绑定
person1.foo1() // person1
// 显示绑定优先级大于隐式绑定
person1.foo1.call(person2) // person2

// foo是一个箭头函数，会找上层作用域中的this，那么就是person1
person1.foo2() // person1
// foo是一个箭头函数，使用call调用不会影响this的绑定，和上面一样向上层查找
person1.foo2.call(person2) // person1

// 调用位置是全局直接调用，所以依然是window（默认绑定）
person1.foo3()() // window
// 最终还是拿到了foo3返回的函数，在全局直接调用（默认绑定）
person1.foo3.call(person2)() // window
// 拿到foo3返回的函数后，通过call绑定到person2中进行了调用
person1.foo3().call(person2) // person2

// foo4返回了箭头函数，和自身绑定没有关系，上层找到person1
person1.foo4()() // person1
// foo4调用时绑定了person2，返回的函数是箭头函数，调用时，找到了上层绑定的person2
person1.foo4.call(person2)() // person2
// foo4调用返回的箭头函数，和call调用没有关系，找到上层的person1
person1.foo4().call(person2) // person1

var name = 'window'
function Person (name) {
  this.name = name
  this.obj = {
    name: 'obj',
    foo1: function () {
      return function () {
        console.log(this.name)
      }
    },
    foo2: function () {
      return () => {
        console.log(this.name)
      }
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

// obj.foo1()返回一个函数，这个函数在全局作用于下直接执行（默认绑定）
person1.obj.foo1()() // window
// 最终还是拿到一个返回的函数（虽然多了一步call的绑定），这个函数在全局作用于下直接执行（默认绑定）
person1.obj.foo1.call(person2)() // window
person1.obj.foo1().call(person2) // person2

// 拿到foo2()的返回值，是一个箭头函数，箭头函数在执行时找上层作用域下的this，就是obj
person1.obj.foo2()() // obj
// foo2()的返回值，依然是箭头函数，但是在执行foo2时绑定了person2，箭头函数在执行时找上层作用域下的this，找到的是person2
person1.obj.foo2.call(person2)() // person2
// foo2()的返回值，依然是箭头函数，箭头函数通过call调用是不会绑定this，所以找上层作用域下的this是obj
person1.obj.foo2().call(person2) // obj

// [['a', 'b'], ['n', 'm'], ['0', '1']]
// ['an0', 'am0', 'an1', 'am1', 'bn0', 'bm0', 'bn1', 'bm0']
const permutation = function(array) {
  let res = []
  permutationHelper(array, 0, [], res)
  return res
}
const permutationHelper = function(array, index, path, res) {
  if (array.length === index) {
    res.push(path.join(''))
    return
  }

  for (let i = 0; i < array[index].length; i++) {
    let char = array[index][i]
    permutationHelper(array, index + 1, [...path, char], res)
  }
}
console.log(permutation([['a', 'b'], ['n', 'm'], ['0', '1']]))

// 版本号排序的方法
// 题目描述:有一组版本号如下['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5']。现在需要对其进行排序，排序的结果为 [ '4.3.5', '4.3.4.5', '4.2', '2.3.3', '0.302.1', '0.1.1' ]
const sortByVersion = function(versions) {
  versions.sort((a, b) => {
    let alist = a.split('.')
    let blist = b.split('.')
    let index = 0

    while (alist[index] && blist[index] && alist[index] === blist[index]) {
      index++
    }

    if (alist[index] && !blist[index]) return -1 // if a is longer, a should be larger
    else if (!alist[index] && blist[index]) return 1 // if b is longer, b should be larger
    else if (alist[index] !== blist[index]) return blist[index] - alist[index] // if a != b, return b - a 

    return 0 // a = b
  })

  return versions
}
console.log(sortByVersion(['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5', '4.3.5.1']))
// result [ '4.3.5.1', '4.3.5', '4.3.4.5', '4.2', '2.3.3',   '0.302.1', '0.1.1']

// create a promise
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
    // chaining promise
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

// EventEmitter
// 题目描述:实现一个发布订阅模式拥有 on emit once off 方法
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 添加订阅
  // 事件是队列的形式
  on(type, handler) {
    let handlers = this.events[type] || []
    handlers.push(handler)
    this.events[type] = handlers
  }

  // 删除订阅
  // 删除事件队列中的其中一个
  off(type, handler) {
    let handlers = this.events[type] || []
    handlers = handlers.filter((item) => {
      return item !== handler
    })
    this.events[type] = handlers
  }

  // 触发事件
  emit(type, ...args) {
    const handlers = this.events[type]
    if (!handlers) return

    handlers.forEach((handler) => {
      handler.apply(this, args)
    })
  }

  // 只执行一次订阅事件
  // 需要使用到on and off
  once(type, callback) {
    let wrapper = function() {
      callback()
      this.off(type, wrapper)
    }
    this.on(type, wrapper)
  }
}
const event = new EventEmitter();
const handler = (...res) => {
  console.log(res);
};
event.on("click", handler);
event.emit("click", 1, 2, 3, 4);
event.off("click", handler);
event.emit("click", 1, 2);
event.once("dbClick", () => {
  console.log(123456);
});
event.emit("dbClick");
event.emit("dbClick");

// 实现一个继承，寄生组合继承
function Parent(name) {
  this.name = name
  this.say = () => {
     console.log("111")
  }
}
function Child(name) {
  Parent.call(this, name) // step 1
  this.name = name
}
Child.prototype = Object.create(Parent.prototype) // step 2
Child.prototype.constructor = Child // step 3
Parent.prototype.play = () => {
  console.log("222")
}

let child = new Child("儿子");
console.log(child.name);
child.say();
child.play();

// 分片思想解决大数据量渲染问题
// 题目描述:渲染百万条结构简单的大数据时 怎么使用分片思想优化渲染
let total = 10000
let current = 0
let max = 20 // create 20 items in one frame
let ul = document.getElementById('thelonglist')
const perform = function() {
  if (current >= total) return

  window.requestAnimationFrame(() => {
    // create and append list
    for (let i = 0; i < max && current < total; i++) {
      let li = document.createElement('li')
      li.innerText = `${current} ${new Date().getTime()}`
      ul.appendChild(li)
      current++
    }

    console.log('next', new Date().getTime())
    // 一个frame只运行一次，所以需要再继续注册
    perform()
  })
}
perform()

// 写一个事件代理函数，需要判断child是parent的子节点
function proxyEvent(event, callback, parent, child) {
  let parentNode = document.querySelectorAll(parent)[0]

  const handler = (event) => {
    // target is the element triggered the event
    // currrent target is the element registred the event
    // 判断target 是否为 child
    if (event.target.matches(child)) {
      // 判断child是parent的子节点
      if (parentNode.contains(event.target)) {
        callback.call(this, event)
      }
    }
  }

  parentNode.addEventListener(event, handler)
}
proxyEvent('click', (e) => {
  console.log(e.target.innerText)
}, '#proxy', 'li')

// 给定一个不含重复数字的数组arr,指定个数n,目标和sum,判断是否含有由n个不同数字相加得到sum的情况，leetcode 40 变种， 数字不得重复使用
function combinationSum(nums, n, sum) {
  let res = []
  nums.sort((a, b) => a - b)
  combinationSumHelper(nums, n, sum, 0, [], res)
  return res
}
function combinationSumHelper(nums, n, sum, index, path, res) {
  if (path.length === n && sum === 0) {
    res.push(path)
    return
  }
  if (sum < 0 || path.length > n) {
    return
  }

  let set = new Set()
  for (let i = index; i < nums.length; i++) {
    let current = nums[i]
    if (set.has(current)) continue
    set.add(current)
    combinationSumHelper(nums, n, sum - current, i + 1, [...path, current], res)
  }
}
console.log(combinationSum([10,1,2,7,6,1,5], 3, 8))

// function request(urls, maxNumber, callback) 要求编写函数实现，
// 根据urls数组内的url地址进行并发网络请求，最大并发数maxNumber,
// 当所有请求完毕后调用callback函数(已知请求网络的方法可以使用fetch api)
function request(urls, maxNumber, callback) {
  let queue = []
  let currentJobs = 0
  let results = []
  const request = require('request');

  const run = function() {
    if (queue.length === 0 || currentJobs >= maxNumber) return

    currentJobs++
    const url = queue.shift()
    console.log('started', url)
    request(url, (error, response, body) => {
      console.log('finshed', url)
      currentJobs--
      if (error) {
        results.push({ error, time: new Date()})
      } else {
        results.push({ res: body, time: new Date()})
      }

      if (results.length === urls.length) {
        callback(results)
        return
      }
      run()
    })
  }

  urls.forEach((url) => {
    queue.push(url)
    run(url)
  })
}
const urls = [
  "https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam",
  "https://www.timeapi.io/api/Time/current/coordinate?latitude=38.9&longitude=-77.03",
  "https://www.timeapi.io/api/Time/current/ip?ipAddress=237.71.232.203",
  "https://www.timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam",
  "https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam",
  "https://www.timeapi.io/api/Time/current/coordinate?latitude=38.9&longitude=-77.03",
  "https://www.timeapi.io/api/Time/current/ip?ipAddress=237.71.232.203",
  "https://www.timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam",
  "https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Amsterdam",
  "https://www.timeapi.io/api/Time/current/coordinate?latitude=38.9&longitude=-77.03",
  "https://www.timeapi.io/api/Time/current/ip?ipAddress=237.71.232.203",
  "https://www.timeapi.io/api/TimeZone/zone?timeZone=Europe/Amsterdam",
]
console.log(request(urls, 3, (res) => {
  console.log(res)
}))

// 实现这个u, u.console('breakfast').setTimeout(3000).console('lunch').setTimeout(3000).console('dinner')
class U {
  constructor() {
    this.tasks = []

    // 关键不然不会执行，首次执行，但是希望在同步任务之后执行
      setTimeout(() => {
        this.next()
      }, 0)
  }

  console(name) {
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(name)
        this.next()
      }, 0)
    })
    return this
  }
  setTimeout(time) {
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(time)
        this.next()
      }, time)
    })
    return this
  }
  next() {
    let task = this.tasks.shift()
    if (task) task()
  }
}
const u = new U()
u.console('breakfast').setTimeout(3000).console('lunch').setTimeout(3000).console('dinner')

// 手写代码：写个单例模式
// es6 class
class SingleClass {
  constructor() {
    this.instance = null
  }

  static getInstance(name) {
    if (this.instance) return this.instance

    this.instance = new SingleClass(name)
    return this.instance
  }
}
let Jack = SingleClass.getInstance('Jack');
let Tom = SingleClass.getInstance('Tom');
console.log( Jack === Tom ); // true

/*
请实现抽奖函数rand，保证随机性
输入为表示对象数组，对象有属性n表示人名，w表示权重
随机返回一个中奖人名，中奖概率和w成正比
*/
let people = [
  { n: 'p1', w: 1 }, // 0 - 1
  { n: 'p2', w: 100 }, // 1 - 101
  { n: 'p3', w: 100 } // 101 - 201
];
let rand = function (p) {
  const totalWeight = p.reduce(function (pre, cur, index) {
    // 1. get the total weight, create a range for each person
    cur.startW = pre;
    return cur.endW = pre + cur.w
  }, 0)
  // 1. get a random number between the total weight
  let random = Math.ceil(Math.random() * totalWeight)
  // console.log(totalWeight, p, random)

  // use array.find method to choose the person who has the random number
  let selectPeople = p.find(people => people.startW < random && people.endW > random)
  return selectPeople.n
};
console.log(rand(people))

// getPathValue({a:{b:[1,2,3]}}, 'a.b[0]') => 1
const getPathValue = function(map, path) {
  return getPathValueHelper(map, path, '')
}
const getPathValueHelper = function(map, path, currentPath) {
  if (path === currentPath) return map

  if (Object.prototype.toString.call(map) === '[object Object]') {
    for (let key in map) {
      let val = map[key]
      let nextPath = currentPath ? `${currentPath}.${key}` : `${currentPath}${key}`
      let res = getPathValueHelper(val, path, nextPath)
      if (res) return res
    }
  } else if (Object.prototype.toString.call(map) === '[object Array]') {
    for (let key in map) {
      let val = map[key]
      let nextPath = currentPath ? `${currentPath}[${key}]` : `${currentPath}${key}`
      let res = getPathValueHelper(val, path, nextPath)
      if (res) return res
    }
  }
}
console.log(getPathValue({a:{b:[1,2,3]}}, 'a.b[1]'))

// 给数组中的字符串编号，f(['ab', 'c', 'd', 'ab', 'c']) => ['ab1', 'c1', 'd', 'ab2', 'c2']，写完后问了一下时间和空间复杂度。
const label = function(list) {
  let map = new Map()
  let res = []

  for (let i = 0; i < list.length; i++) {
    let val = list[i]
    if (map.has(val)) {
      let count = map.get(val) || 0
      if (count === 1) {
        let index = res.indexOf(val)
        res[index] = `${val}1`
      }
      count++
      map.set(val, count)
      res.push(`${val}${count}`)
    } else {
      map.set(val, 1)
      res.push(`${val}`)
    }
  }

  return res
}
console.log(label(['ab', 'c', 'd', 'ab', 'c']))

// 实现千分位格式化函数
const toThousands = function(num) {
  let array = num.toString().split('')
  let count = 0
  let res = ``

  for (let i = array.length - 1; i >= 0; i--) {
    if (count && count % 3 === 0) {
      res = `${array[i]},${res}`
    } else {
      res = `${array[i]}${res}`
    }
    count++
  }

  return res
}
console.log(toThousands(11112312312))

// SDK 的模拟实现：
// 实现一个sum，执行asyncAdd
function asyncAdd(a, b, cb) {
    setTimeout(() => {
        cb(null, a + b);
    }, Math.floor(Math.random()*1000))
}

const asyncAddSync = function(a, b) {
    return new Promise((resolve, reject) => {
        asyncAdd(a, b, (err, result) => {
            resolve(result)
        });
    })
}

// 要求 sum 能在最短的时间里返回以上结果 
const sum = function(...args) {
    return new Promise(async (resolve, reject) => {
        // slow
        // let sum = args.shift()
        // for (let num of args) {
        //     sum = await asyncAddSync(sum, num)
        // }
        // resolve(sum)

        // fast
        // the final sum is at index 0
        if (args.length === 1) {
            resolve(args[0])
            return
        }
        let promises = []
        let res = []
        for (let i = 0; i < args.length; i += 2) {
            // odd args, push last one to res
            if (!args[i+1]) {
                res.push(args[i])
                continue
            } 
            let a = args[i]
            let b = args[i+1]
            promises.push(asyncAddSync(a, b))
        }
        // add all to res for next round
        let all = await Promise.all(promises)
        res = res.concat(all)
        resolve(await sum(...res))
    })
}

asyncAdd(3, 5, (err, result) => {
    console.log(result); // 8
});

// 现在要求在本地机器上实现一个 sum 函数，支持以下用法：
(async () => {
    const result1 = await sum(1, 4, 6, 9, 2, 4);
    const result2 = await sum(3, 4, 9, 2, 5, 3, 2, 1, 7);
    const result3 = await sum(1, 6, 0, 5);
    console.log([result1, result2, result3]); // [26, 36, 12]
})();
