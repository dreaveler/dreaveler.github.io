---
title: "10 C++泛型程序设计（3）—— STL进阶"
subject: 软件设计实践
---
tag: #泛型程序设计 
# 关联容器
## 有序关联容器
有序排列  插入和检索需要O(nlogn)
set/multiset   `<set>`
集合
map/multimap    `<map>`
映射    key/value
##### 无需关联容器
unordered_map  unordered_multiset
unirdered_map unordered_multimap
#### 成员函数
find
lower_bound
upper_bound
equal_bound
count
insert
### pair模板
`pair<int,int>`
`make_pair(200,3,14)`函数  以v1和v2创建一个新对象
常用auto来推导返回值
#### multiset
`multiset<C>a`
`multiset<C,less<C>>`  模板中有Pred定义了元素的格式
###### 成员函数
`interator find(const T& val)` 查找某个元素值返回迭代器  如果找不到返回end
	$x<y$ $y<x$均不成立即为相等
`pair<iterator,iterator> equal_range(const T& val`
##### set
无重复的
#### multimap
`<key,value，Pred=less<Key>`
每个元素是pair类型对象
按照关键字升序排列
没有重载`[]`
key一样按插入顺序
#### map
关键字各不相同
可以用`[]`通过访问关键字访问对应的值
也可以通过填写一个新的来创建新键对（同python）
## 容器适配器
封装顺序容器  重新组合该容器中包含的成员函数   使其满足某些特定场景的需要
stack  queue   priorty_queue
本质还是容器  但实现利用了大量其他基础容器模板类已经写好的成员函数
##### stack
只能插入/访问/删除栈顶的元素
##### queue
##### priority_queue

# 输入输出迭代器
自定义流操纵算子
	函数
	iostream里对<<进行了重载
	`ostream& operator<<(ostream(*p)(ostream&));`
输入输出迭代器
istream_iterator<T> input(cin)
使用>>从输入流读入连续的元素
支持== != * -> ++
++是从输入流中读取一个元素保存在中
构造时会读取一个元素
输出迭代器
支持* -> ++
使用=进行输出
还可以提供第二实参  表示输出元素后的分割字符串
copy函数可以从输入流读取数据到容器 或向输出流中写入容器中的数据

## String
字符串输出流

```
tag: #泛型程序设计 
# 关联容器
## 有序关联容器
有序排列  插入和检索需要O(nlogn)
set/multiset   `<set>`
集合
map/multimap    `<map>`
映射    key/value
##### 无需关联容器
unordered_map  unordered_multiset
unirdered_map unordered_multimap
#### 成员函数
find
lower_bound
upper_bound
equal_bound
count
insert
### pair模板
`pair<int,int>`
`make_pair(200,3,14)`函数  以v1和v2创建一个新对象
常用auto来推导返回值
#### multiset
`multiset<C>a`
`multiset<C,less<C>>`  模板中有Pred定义了元素的格式
###### 成员函数
`interator find(const T& val)` 查找某个元素值返回迭代器  如果找不到返回end
	$x<y$ $y<x$均不成立即为相等
`pair<iterator,iterator> equal_range(const T& val`
##### set
无重复的
#### multimap
`<key,value，Pred=less<Key>`
每个元素是pair类型对象
按照关键字升序排列
没有重载`[]`
key一样按插入顺序
#### map
关键字各不相同
可以用`[]`通过访问关键字访问对应的值
也可以通过填写一个新的来创建新键对（同python）
## 容器适配器
封装顺序容器  重新组合该容器中包含的成员函数   使其满足某些特定场景的需要
stack  queue   priorty_queue
本质还是容器  但实现利用了大量其他基础容器模板类已经写好的成员函数
##### stack
只能插入/访问/删除栈顶的元素
##### queue
##### priority_queue

# 输入输出迭代器
自定义流操纵算子
	函数
	iostream里对<<进行了重载
	`ostream& operator<<(ostream(*p)(ostream&));`
输入输出迭代器
istream_iterator<T> input(cin)
使用>>从输入流读入连续的元素
支持== != * -> ++
++是从输入流中读取一个元素保存其中
构造时会读取一个元素
输出迭代器
支持* -> ++
使用=进行输出
还可以提供第二实参  表示输出元素后的分割字符串
copy函数可以从输入流读取数据到容器 或向输出流中写入容器中的数据

## String
字符串输出流
