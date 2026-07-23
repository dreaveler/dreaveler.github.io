---
title: "5 Image Stitching"
date: "2025-10-16"
number: 5
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/5 Image Stitching/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# Panorama(全景图)
## review Transformation
对于filter操作  它改变的是值域
对于warping操作  改变的是定义域
想要生成全景图 要解决的就是不同照片之间带来的warping变化
### Examples
我们定义一个变换T  那么如何求解它
p' = T(p)  p为点集
T是对所有点的操作都相同的一个函数  并不依赖于图像的内容
常见操作有：translation  rotation   aspect  affine  perspective   cylindrical(圆柱形)
我们可以利用齐次坐标系来对transformation线性化
$$
\begin{bmatrix}x^{'} \\ y^{'} \\ 1 \end{bmatrix} = \begin{bmatrix}a&b&c\\d&e&f\\0&0&1\end{bmatrix} = T\begin{bmatrix}x\\y\\1 \end{bmatrix}
$$
degrees of freedom是6
对于translate  scale  2D in-plane rotation  shear 都可以使用使用这个描述
![](/images/notes/计算机视觉/d9b77dfe56fe-01.png)
如果不使用齐次方程  我们可以得到 $x^{'} = Ax+b$
我们对于每一组点 可以得到前后的映射
$$
\begin{bmatrix}x^{'}\\ y^{'}\end{bmatrix} = \begin{bmatrix}a&b\\d&e\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix} + \begin{bmatrix}c\\f\end{bmatrix}
$$

然后我们可以对于所有的点列出一个大的方程
![](/images/notes/计算机视觉/d9b77dfe56fe-02.png)
每个点可以列出两个方程 一共存在6个未知数 那么想要解出未知数 我们需要三个不共线的点
当然实际实现中  我们可以利用更多个点对来计算
我们可以获取最优解通过最小二乘解
$$
E = ||At-b||^2_2 = t^TA^TAt-2t^TA^Tb+b^Tb
$$
E是一个二次的  并且我们取一阶导并令它接近于0
$$
A^TAt = A^Tb
$$
由于 $A^TA$总是满秩的  因此可以取逆 最后解得
$$
t = (A^TA)^{-1}A^Tb
$$
![](/images/notes/计算机视觉/d9b77dfe56fe-03.png)
![](/images/notes/计算机视觉/d9b77dfe56fe-04.png)
![](/images/notes/计算机视觉/d9b77dfe56fe-05.png)
对于前两张图片与第三张图片 它们并不是affine  因此齐次坐标系线性化中的A矩阵最下面的一行0 0 1不可以使用
### Homography
这个过程是纠正视角变化之间带来的差异   它可以用于纠正这个过程带来的形变
而它是描述这两张照片之间几何变换关系的矩阵
它的最后一行是
$$
\begin{bmatrix}g&h&i\end{bmatrix}
$$
而不是
$$
\begin{bmatrix}0&0&1\end{bmatrix}
$$
  一个homography矩阵是这样的：
$$
\begin{bmatrix}a&b&c\\d&e&f\\g&h&i\end{bmatrix}
$$
但由于我们的计算是通过齐次方程实现的  我们可以设定i为1或者这个向量的L2为1 使得它只有8个自由度  因此只需要4个不共线的点就可以解出
这个变换应该是在对一个平面上的两个视角的变换  从这两张图片应当相遇共同的中心
通过这个映射变换  我们可以建立$x^'$   $y^'$与x  y 建立起联系
$$
x^{'}_i = \frac{h_{00}x_i + h_{01}y_i + h_{02}}{h_{20}x_i + h_{21}y_i + h_{22}}
$$
$$
y_i^{'} = \frac{h_{10}x_i + h_{11}y_i + h_{12}}{h_{20}x_i + h_{21}y_i + h_{22}}
$$
然后我们可以对其进行化简并提取出Ah=0
![](/images/notes/计算机视觉/d9b77dfe56fe-06.png)
令h的L2为1时  然后我们需要最小化能量方程   这是在使用拉格朗日乘子法进行最小值计算
$$
E = ||Ah||^2 + \lambda(||h||^2 - 1) =  h^TA^TAh + \lambda h^Th - \lambda
$$
对它求一阶导  得到 $A^TAh = \lambda h$    这是一个特征值问题！  $A^TA$是一个对称的半正定矩阵
因此  $E = \lambda$   如果要最小化E，h就应该选择最小的特征值对应的特征向量
而其对应的是对$A^TA$进行SVD分解得到的V中的最后一列


$\lVert Ah\rVert^2$衡量了用于优化的代数差距，用 $\sum_{i=1}^k \lVert[x_i',y_i']-T([x_i,y_i])\rVert^2 + \lVert[x_i,y_i]-T^{-1}([x_i',y_i'])\rVert^2$来衡量几何差距
# Feature matching
给出两张图片 我们可以提取关键点并match  然后进行全景图的生成  但通过最近邻进行match显然是有问题的
因为进行线性回归时我们会受到outliers的干扰 因此关键点时剔除outliers
而方法就是RANSAC(这个也可以写详情见cv导的)
过程
- 随机选取最少数量的点可以生成一个model
- 拟合出model  然后计算出有多少的inlier
- 重复N次
- 选取有最多inlier的模型
- 通过所有的inlier拟合出最后的结果


问题
- 如何找到inlier
	- 根据扰动设置一个threshold
	- 也可以用几何扰动来衡量是inlier/outlier
- 什么时候结束
	- 这是与outlier的数量相关的 但我们需要保证成功的概率
	- 假设inlier的比例是G  模型需要P对点去fit   那么在N个iterations之后我们没有选到一组inlier的点的概率是： $(1 - G^P)^N$
	- 如果我们希望失败的概率小于loge   那么 $N > \frac{\log e}{\log (1-G^P)}$
### 优劣势
pros:
- 简单通用
- 可对很多问题使用
- 总是在实际中表现的比较好
cons:
- 有需要调整的参数
- 对于低inliers率也许会失败
- 需要非常多的迭代


# Image blending
### 如何构建全景图
- 提取特征点
- 特征点匹配
- 解决transformation
- blend images
### 泊松编辑
关键想法：源图像的导数应该被保留
详情请见vcl
![](/images/notes/计算机视觉/d9b77dfe56fe-07.png)
那么如何解这个最小的E呢
![](/images/notes/计算机视觉/d9b77dfe56fe-08.png)
### 用泊松编辑来构建全景图
- 解出homography矩阵
- 将源图像warp到参考图像
- 将mask图像warp到参考图像
- 保持在mask  region的梯度(跑泊松编辑)
