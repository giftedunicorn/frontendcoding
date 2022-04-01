# 前端面试之手写代码大全

## 介绍

在前端面试中，除了要了解前端知识（八股文），还需要熟练算法题。但是有别于后端面试，前端的算法中还会让你手写一些常用的前端接口，比如手写bind，手写reduce，手写new等等。

刚开始感觉很无语，写这些简直是浪费感情，但是面试多了发现各家面试官都会问这种问题。而且有一定的规律和套路，经常问来问去就那几个问题。不像leetcode，都已经堆到2000+题了。所以今天分享一下我收集的和总结的前端面试手写代码算法题。

1. 实现一个深克隆 deepClone。刚开始可以先实现一个简单的，对象中只有string和number，熟练了之后可以试试对象中包括Date，循环对象，和正则表达。(蔚来，Bayer真题)

```

```

2. 实现一个防抖函数 debounce (特斯拉OA真题)

3. 实现一个截流函数 throttle

4. promise all

5. promise race（字节真题）

6. promise scheduler (字节，Bayer真题)

7. my reduce (力扣真题)

8. my AJAX 

9. my instanceof

10. my typeof

11. my new

12. my call

13. my apply

14. my bind

15. my trim

16. my curry

17. my promise

18. json to string

19. string to json

20. dom to json

21. json to dom

22. tree to list

23. list to tree

24. path to obj

25. obj to path

26. flatten array

27. dedup array

28. 大数相加

29. 分红包

30. LazyMan

31. 每个一秒打印一个数字，用setTimeout来实现

32. this的指向问题，看题目说答案

33. 排列 [['a', 'b'], ['n', 'm'], ['0', '1']] => ['an0', 'am0', 'an1', 'am1', 'bn0', 'bm0', 'bn1', 'bm0']

34. 版本号排序的方法，题目描述: 有一组版本号如下['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5']。现在需要对其进行排序，排序的结果为 [ '4.3.5', '4.3.4.5', '4.2', '2.3.3', '0.302.1', '0.1.1' ]

35. EventEmitter，题目描述: 实现一个发布订阅模式拥有 on emit once off 方法

36. 实现一个继承，寄生组合继承

37. 题目描述: 渲染百万条结构简单的大数据时 怎么使用分片思想优化渲染

38. 写一个事件代理函数，需要判断child是parent的子节点

39. 给定一个不含重复数字的数组arr,指定个数n,目标和sum,判断是否含有由n个不同数字相加得到sum的情况，leetcode 40 变种， 数字不得重复使用

40. function request(urls, maxNumber, callback) 要求编写函数实现，根据urls数组内的url地址进行并发网络请求，最大并发数maxNumber，当所有请求完毕后调用callback函数(已知请求网络的方法可以使用fetch api)

41. 手写代码：写个单例模式

42. 请实现抽奖函数rand，保证随机性，输入为表示对象数组，对象有属性n表示人名，w表示权重，随机返回一个中奖人名，中奖概率和w成正比

43. 实现这个u, u.console('breakfast').setTimeout(3000).console('lunch').setTimeout(3000).console('dinner')

44. getPathValue({a:{b:[1,2,3]}}, 'a.b[0]') => 1

45. 实现千分位格式化函数

46. 给数组中的字符串编号，f(['ab', 'c', 'd', 'ab', 'c']) => ['ab1', 'c1', 'd', 'ab2', 'c2']，写完后问了一下时间和空间复杂度。

47. 实现一个sum，执行asyncAdd

48. 实现一个object add函数

