---
title: "4 Feature Detection"
date: "2025-09-25"
number: 4
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/4 Feature Detection/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# 边缘检测
## 图像的偏导
边缘检测就是图像中颜色变换剧烈的位置，也就是导数大的位置
X方向的偏导：
$$
\frac{\partial f(x,y)}{\partial x}
=\lim_{\epsilon\to 0}\frac{f(x+\epsilon,\,y)-f(x,y)}{\epsilon}
$$

前向差分：$\frac{\partial f(x,y)}{\partial x} \approx \frac{f(x+1,y)-f(x,y)}{1}$
中间差分：$\frac{\partial f(x,y)}{\partial x} \approx \frac{f(x+1,y)-f(x-1,y)}{2}$
中间差分的精度比前向差分更高，可以通过泰勒展开证明
显然，偏导可以通过滤波计算得到 除此之外还有其它的算子操作
<table fit-page-width="true" header-row="true">
<tr>
<td>算子</td>
<td>水平 Gx</td>
<td>垂直 Gy</td>
</tr>
<tr>
<td>Prewitt</td>
<td>`<br>[-1  0  1]<br>[-1  0  1]<br>[-1  0  1]<br>`</td>
<td>`<br>[ 1  1  1]<br>[ 0  0  0]<br>[-1 -1 -1]<br>`</td>
</tr>
<tr>
<td>Sobel</td>
<td>`<br>[-1  0  1]<br>[-2  0  2]<br>[-1  0  1]<br>`</td>
<td>`<br>[ 1  2  1]<br>[ 0  0  0]<br>[-1 -2 -1]`</td>
</tr>
</table>
## 有noise的处理方法
需要注意的是，noise极其影响图像的偏导
经过概率论的计算可以证明，噪声会成倍的干扰偏导的计算
而噪声就是会对高频产生影响，我们可以先用高斯模糊将高频信息抹去，保留低频主体信息之后再计算偏导得到边缘
而可以注意的是 这两次滤波是可以叠加为一次操作的
### 图像偏导的基本信息
每个点的偏导可以表示为用x向和y向表示为2Dvec
它的方向与绝对值也就可以计算
## Canny Detector
其实我想写详情请见CV导的  但突然想到CV导的笔记没有发布过)  就再写一遍吧
- 转为灰度图 guass模糊
- 边缘滤波 Sobel算子
- 计算绝对值
- NMS(Non-Maximum Suppression）非极大值抑制
	- 用来处理边缘线太粗的情况
	- 对于边缘线上的每个点，比较与它垂直方向的点，使得它比垂向的点的导数值大
- 双阈值处理
	- 对于值较高的点 一定是线
	- 值小于低阈值的点  一定不是线
	- 对于高于低阈值 小于高阈值 的点 如果可以连接成线  则连线
# 角点检测
### Harris Corner Detector
角点是两条边的交点
这个算法的关键点是 平面 边 与角点在一个小窗内移动时变化是不同的
- 平面 不会发生变化
- 边 一个方向发生变化
- 角点 所有方向发生变化
下面是实现方案：
对于一个小窗 W 考虑小窗平移 $(u,v)$ 的距离
实际变化 $E(u,v) = \sum_{(x,y)\in W} w(x,y)(I(x+u,y+v) - I(x,y))$
但显然这样的计算是很慢的
考虑泰勒展开，$I(x+u,y+v) ≈ I(x,y) + I_x u + I_y v$
通过这种方式  我们可以简化 $E(u,v) = \sum_{(x,y) \in W} (I_x ^2 u^2 + 2I_x I_y uv + I_y ^2 v^2)$
然后简化为二次型的形式     $𝐸[𝑢,𝑣]=[𝑢,𝑣]𝑴[𝑢,𝑣]^𝑇$
$$
M = \begin{bmatrix} \sum_{x,y \in W}I_x^2 & \sum_{x,y \in W} I_x I_y \\   \sum_{x,y \in W} I_x I_y & \sum_{x,y \in W} I_y^2 \end{bmatrix}
$$

我们回忆二次型的线性代数性质  若令$E[u,v] = a$  当两个特征值\>0 时  截的的是一个椭圆
我们对M 特征值分解
$$
M = R^{-1} \begin{bmatrix} \lambda_1& 0 \\ 0 & \lambda_2 \end{bmatrix} R
$$

R的两个正交化的向量分别代表椭圆的方向  $\lambda_1$ $\lambda_2$分别代表轴长
如果 $\lambda1 >> \lambda2$  亦或是相反   说明E在一个方向上增长迅速 说明它是边
若 $\lambda1 \  \  \ \lambda2$都很大  说明E在各个方向上都增长迅速  说明它是corner
else  说明是flatten的平面
![](/images/notes/计算机视觉/d22a1cac6baa-01.png)
为了避免直接计算特征值  提出一个响应函数：
$$
\begin{aligned}R &= det(M) - \alpha \times trace(M)^2\\ &= \lambda_1 \lambda_2 - \alpha (\lambda_1 + \lambda_2)^2 \end{aligned}
$$

这样当R远大于0时  就说明是角点区域   当R远小于0时  说明是边   else  是平面
具体实现
- 转变为灰度图然后高斯模糊滤去噪声
- 使用Sobel算子对x和y方向计算d
- 对于每一个pixel  考虑3\*3小窗进行移动  计算M 以及 R
- 进行分析并进行NMS
### Corner的properties
由于所有操作都通过卷积完成 因此具有平移不变性
由于旋转之改变R的方向 因此具有旋转不变性
对于仿射强度变化   $I_{new} = \alpha I_{old} + \beta$
由于M只与d有关 因此 $\beta$是不变的  但由于 $\alpha$ 会影响d的大小  因此具有部分仿射不变性
但对于缩放 一个corner缩放后可能会变为edge  因此不具有缩放不变性


那么为了使得corner具有缩放不变性 我们对高斯金字塔的每一层进行Harris corner 检测  得到的通用角点就具有缩放不变性了
# Blobs
边与点都具有限制： 边很难定位 而 点是不佳而区分的
因此我们检测blobs
blob就是与周围区域颜色/亮度不同的区域 它是有固定位置 易于定位 有大小的
从使用gauss核进行边缘滤波操作开始：
对于一个区域的卷积操作 它是对应区域的积分  而先用高斯核积分再求导等价于直接积分高斯核的导数
![](/images/notes/计算机视觉/d22a1cac6baa-02.png)
在了解了以上内容后，证明我们的第一个结论：f与h的导数的卷积的极值是一个边
我们设f(x)是一个阶段跃迁函数，它很好的描述了一个edge  当x\<x0时  它的值约等于0  x\>x0时 它的值约为1  h(x)是一个guass函数
对于f(x) 它的导数是狄拉克$\delta$函数 它在x0处趋于无穷 其余位置接近0  其积分为1  它精确的显示了边缘的位置
而一个函数与 $\delta$函数的卷积 相当于把它移到x0的位置
因此对应的edge便是x0的位置
为了使得极值与 $\delta$无关 再进行归一化


下面证明第二个结论：f与h的二阶导的卷积的零点是一个edge
![](/images/notes/计算机视觉/d22a1cac6baa-03.png)
![](/images/notes/计算机视觉/d22a1cac6baa-04.png)
下面来看怎么检测blob
在1D上，我们可以定义blob为 $f(x) = u(x-x_0) - u(x-x_1)$    显然 当 $x_0 < x < x_1$时 对应区域是一个高台 而用高斯函数的二阶导来进行卷积 当gauss函数的小窗和高台的直径一样大时 就可以获得中心点作为极值
![](/images/notes/计算机视觉/d22a1cac6baa-05.png)
1D总结：利用二阶gauss函数导数来进行卷积  得到了一系列的响应值为 $L(x,\delta)$  blobs被探测为局部的最大最小值
$\sigma$是对应的特征尺寸  与blob的大小成正比
### 2D blob
那么2D也是同样的原理  对x方向上探测blob再对y  再相加  而这可以合并为拉普拉斯算子
做法就是用不同大小的 $\sigma$来计算归一化的拉普拉斯算子  (Normalized Laplacian of Gaussian : NLoG, $\sigma^2\nabla^2G(x,y,\sigma)$) ，获取不同的x和 $\sigma$ 之后进行比较 获得blob中心以及size
# SIFT feature
由具有规模不变性的关键点中选取出的可区分的图片特征点
blobs就是规模不变的特征点  当我们放缩blob时 对于归一化的NLoG  也可以相应的放缩并识别出来
blob同样对rotation  noise等等鲁棒
我们可以证明Difference of Gaussian(DoG)是与NLoG相近的  同时它的计算也要更快
![](/images/notes/计算机视觉/d22a1cac6baa-06.png)
那么我们就可以利用这个性质来用高斯金字塔来进行blobs的检测
过程
- 用不同大小的gauss核来做多组gauss金字塔
- 在每一个尺寸上用成比例的gauss核来分别对图片进行模糊  而后者减前者便是DoG
![](/images/notes/计算机视觉/d22a1cac6baa-07.png)
我们可以证明卷积的结合律 又由于 两个gauss分布之和仍然是gauss分布 其均值和方差是相加
而两个gauss核的卷积可以合并为一个  其 $\sigma_z = \sqrt{\sigma_x^2 + \sigma_y^2}$
通过这一性质可以加速高斯金字塔的构建
比如说将前一尺寸用较高 $\sigma$得到的图像直接降采样就可以放入下一尺寸
blob的探测： 对于前一层级与下一层级的9个邻居  以及同一层级的8个邻居  合计26个邻居 如果是max/min  则是一个blob的中心点
### Blob keypoint detection
- 在原有图像中利用DoG获取关键点  包含以下信息(位置  尺度  方向)  其中包含大量不稳定点
- 设置一个阈值  剔除掉DoG响应值小的点  这些点对噪声和光照敏感
- 利用Hessian 矩阵去除掉边缘点 当这个矩阵的特征值有一个远远大于另一个时  就是边缘点  不必直接计算 可以利用迹和行列式得到结果  r时手动设置的阈值  即不希望比值超过多少
![](/images/notes/计算机视觉/d22a1cac6baa-08.png)


下面来为关键点分配主方向 principal Orientation
- 以关键点为中心 使用其尺度大小得到一个圆形窗口  对其中每个点计算导数 得到梯度幅值与方向：tan-1(dy/dx) 划分到36个bins去(每个bin10度)  用梯度幅值乘上高斯分布进行投票
- 得到峰值最高的bin  这个就是principal  orientation   此外还会保留峰值80%以上的方向作为辅方向
生成128维描述向量
- 将关键点邻域内的所有像素点旋转至关键点主方向 即其所有导数方向-该角度
- 取一个以关键点为中心的邻域窗口(16pixel\*16)  将其划分为4\*4个子区域
- 在每个子区域内对八个方向进行投票  同样是利用梯度幅值\*高斯加权
- 那么现在就得到了16\*8个投票后的向量  将其拼接
- 将向量进行归一化(L2)  以避免光照带来的干扰   为了应对非线性光照变化  进行大值抑制  热顶一个threshold  将\>它的值全部一直到threshold  再做一次归一化
实施细节
- 使用关键点尺度大小来选择高斯核大小来模糊图片
- 预先计算出金字塔所有层级的梯度
- 将特征归一化
- 使用4\*4的窗口大小将进行投票  8个方向  最后应该得到128维向量
### Summary of SIFT
使用blob detection保证尺度不变性
投票得到主方向 保证旋转等变形
将最后得到的向量归一化  使得对噪声和光照robust  以及可区分的
充分利用金字塔加速计算
用于图像匹配与识别


如何比较SIFT得到的向量
两个都是SIFT描述器(128维)
- L2   越小越好
- Normalized  互相关  越大越好


## HoG算子
resize图像大小到128\*64 计算每个点的导数  幅值与方向
8\*8划分为一个细胞单元  每个像素根据其幅值与方向进行投票  划分为9个方向(20°)
把2\*2的细胞单元作为一个更大的块进行组合  stride=1  也就是说不同块之间会有重叠
将其投票进行拼接与归一化 最后得到的36维vec就是这个块的HoG特征
