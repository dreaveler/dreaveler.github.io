---
title: "9 Structure from Motion"
date: "2025-11-28"
number: 9
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/9 Structure from Motion/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

输入为由不知道参数的相机拍摄的许多张图片   输出为相机的参数以及物体的3D模型
### vs Calibration&triangulation
calibration的输入是一个由3D到2D的点对  输出是相机参数
triangulation的输入是相机参数以及2D22D的点对  输出3D坐标
而structure from motion的输入为2D 2 2D的点对 输出3D坐标以及相机参数
## SfM的不明确
用多幅图像做SfM时 是有模糊性的  这是因为  $x \simeq P X = P Q^{-1}(QX)$
也就是说 如果没有一个已知长度的参考 只会得到相对尺寸 而不可能得到绝对尺寸
### projective ambiguity
当我们对相机标定矩阵不加任何约束的情况下 那么SfM恢复出的图像是投影上等价的
公式仍为上面的公式 其中Q为一个满秩矩阵
### Affine ambiguity
如果加上平行约束 那么恢复出的模型是在仿射上模糊的
其中
$$
Q = \begin{bmatrix}A&t\\0^T&1 \end{bmatrix}
$$
   A为一个 $3 \times 3$ 满秩矩阵
### similarity ambiguity
如果重建是加上相机参数和/或场景上的正交约束的话  那么最后得到的就是基本一致的 只差一个全局上的旋转 平移 尺度的
其中
$$
Q = \begin{bmatrix} sR & t \\ 0^T&1\end{bmatrix}
$$
  R为一个旋转矩阵 s是全局尺度因子
# Affine SfM
### Affine camera
对于仿射或弱透视投影相机来说 它的数学相对更加简单  所谓弱透视投影 即增加焦距 增大相机距离  得到的本应交于焦点的线近似于平行
正交投影可以很好的估计弱透视投影相机
正交投影的实现方式就是把z扔掉
$$
\begin{bmatrix}x\\y\\1\end{bmatrix} = \begin{bmatrix}1&0&0&0\\0&1&0&0\\0&0&0&1\end{bmatrix} \begin{bmatrix}x\\y\\z\\1\end{bmatrix}
$$

使用正交投影的相机我们称为仿射相机 用它来进行SfM
其相机矩阵如下：
$$
P =\begin{bmatrix} K_{2D} & t_{2D} \\ 0 & 1 \end{bmatrix}\begin{bmatrix}1 & 0 & 0 & 0 \\0 & 1 & 0 & 0 \\0 & 0 & 0 & 1\end{bmatrix}\begin{bmatrix} R_{3D} & t_{3D} \\ 0 & 1 \end{bmatrix}\Rightarrow P= \begin{bmatrix}a_{11} & a_{12} & a_{13} & t_1 \\a_{21} & a_{22} & a_{23} & t_2 \\0 & 0 & 0 & 1\end{bmatrix}
$$
这个投影矩阵是一个3Dto2D的线性mapping再加上平移
对于非齐次坐标系的坐标来说 这个过程可以写为
$$
\begin{bmatrix}x\\y\end{bmatrix} = AX + t
$$
    t为世界原点的投影
### Affine SfM
下面来先对问题进行建模
给出m张图片 其中有n个在三维空间中的点 本身可以控制的有2mn个自由度(mn个图片上的点  每个点的xy)  而拟合出的A X t 由于有仿射不明确性 因此有矩阵Q 是无法确定的 因此有12个自由度无法控制
因此最后得到的自由度为 8m+3n-12   我们需要2mn≥8m+3n-12
下面进行中心化
对于每一幅图像的点 减去其mean
$$
\begin{aligned}
\hat{x}_{ij}
&= x_{ij} - \frac{1}{n}\sum_{k=1}^{n} x_{ik} \\
&= A_i X_j + t_i - \frac{1}{n}\sum_{k=1}^{n} (A_i X_k + t_i) \\
&= A_i\left( X_j - \frac{1}{n}\sum_{k=1}^{n} X_k \right) \\
&= A_i \hat{X}_j
\end{aligned}
$$
这相当于把世界坐标系原点设在3D点的mean处  从而消去了显式的t
这样我们就可以列出线性方程
$$
\begin{aligned}&\text{m cameras, } \hat{x}_{ij} \text{ is a 2D vector, so the row is } 2m. \\[6pt]&\underbrace{\begin{bmatrix}\hat{x}_{11} & \hat{x}_{12} & \cdots & \hat{x}_{1n} \\\hat{x}_{21} & \hat{x}_{22} & \cdots & \hat{x}_{2n} \\\vdots       & \vdots       & \ddots & \vdots     \\\hat{x}_{m1} & \hat{x}_{m2} & \cdots & \hat{x}_{mn}\end{bmatrix}}_{D_{2m\times n}}=\underbrace{\begin{bmatrix}A_1 \\[3pt]A_2 \\[3pt]\vdots \\[3pt]A_m\end{bmatrix}}_{M_{2m\times 3}}\;\underbrace{\begin{bmatrix}X_1 & X_2 & \cdots & X_n\end{bmatrix}}_{S_{3\times n}}\end{aligned}
$$
由于每个 $\hat{x_{ij}}$是3D向量映射得到的2D电脑  因此rank(D)最大为3
那么对D做SVD分解  只保留最大的三个奇异值 得到$U_3$  $\sum_3$ $V_3$
将中间对角矩阵的每个元素开方 $M = U_3 \sum_3^{\frac{1}{2}}$   $S = \sum_3^{\frac{1}{2}}V_3^T$
这就是得到M S的一种方式
但仍然存在不明确性 Q
因此我们需要对Q也添加约束 例如 我们要求$A_iQ$为一个正交投影矩阵
那么对于一个正交投影矩阵 $AQ_{2\times 3}$   它的前两行为$a_1$ $a_2$ 需要 $a_1 \cdot a_2=0$   且每个向量的模长为1
由于是正交阵  $A_iQ(A_iQ)^T=I_2$  $A_iQQ^TA_i^T=I_2$  这为每个相机提供3个约束 (对称矩阵的三个独立元素) m张图片提供3m个方程
我们需要解的是 $N = Q Q^T$   这个约束对于它是线性的  因此可以用最小二乘来解
而N是对称标定矩阵  Q可以用Cholesky分解得到
那么我们就可以更新相机矩阵A以及3D坐标X了
## Dealing with missing data
对于一个2m\*n的矩阵 很多点只是在该图片可见 而在其它图片并不可见 这样就不是一个简单的低秩完整矩阵 而一个自然想法是将这个矩阵分为很多个全观测的稠密块  分别做因子分解再融合  但这是NPhard的问题
这里提供一种解法  “增量双线性精化”
现在矩阵中选择一个稠密小块 只在这个子块上做标准的低秩分解 得到这个部分的相机矩阵以及3D点
对于新的3D点 只要这个点在两个已经标定好的相机中被观测 就可以使用triangulation来估计它的点 这一步等价于给定相机求点(扩展列)
对于新的相机 只要这个相机可以看到三个已经重建好的3D点 就可以通过外参标定解出相机矩阵(扩展行)
# Projective SfM
先进行问题建模
$$
x_{ij} = P_iX_j
$$
由于是透视投影 因此对齐次线性方程组是线性的   而知道的自由度为2mn  3D点的自由度为3n  相机矩阵为 $3\times 4$矩阵 因此有12个自由度 又因为矩阵为齐次的 因此$P_i = \lambda P_i$  即乘以一个因子对于成像无影响  因此减去1个自由度为11   而又由于Q的不确定性 需要减去15(16-1)个自由度  因此需要2mn≥11m+3n-15
也就是说 对于2张图 需要7个点
## 两相机情形
- 先用标准化的8点算法计算两个视角之间的Fundamental矩阵
	- 实际中 在有内参猜测的情况下 SfM的pipeline常用5点算法估计Essential矩阵
- 初始化相机参数  第一个为$[I|0]$
	- 在用F矩阵计算的情况下 第二个写为$[A|t]$  e为$F^Te=0$的极线  而$A = -[e_\times]F$
	- 用E矩阵计算的话  第二个写为 $[R|t]$  而R t可以由E算出
- 由于有了两个初始相机矩阵 那么就可以通过triangulation求3D点  再通过bundle adjustment做非线性优化 联合调整相机和点，减小重投影误差
- 进行scale 选取一个尺度 例如令 $||t||=1$  等
- 通过自标定等其它方法把projective 重建变为度量重建
### 由基础矩阵得到相机
我们定义相机矩阵为$P_i = [A_i|b_i]$
考虑到有projection ambiguity我们添加一个射影变换矩阵H  $P_1H^{-1} = [I|0]$   $P_2H^{-1} = [A|b]$
![](/images/notes/计算机视觉/f8cdb4202dac-01.png)
通过上面一系列方式我们得到了F 且它与H无关
那么我们可以进行反推  e为极线
那么 $A = -[e_\times]F$    $b=e$
### Bundle adjustment
把所有的相机参数与3D点作为变量 最小化重投影误差
![](/images/notes/计算机视觉/f8cdb4202dac-02.png)
### self-calibration
自标定的核心目标是：在没有专门拍标定板、也没有已知内参的情况下，只利用多张普通照片和它们之间的几何约束，自动恢复每张相机的内参，从而把 projective 重建升级为 metric 重建。
# Incremental SfM
增量SfM的操作就是先用两张图完成一个小模型 再不断添加相机/加点
- 先选一对匹配点很多的图像 估计F/E矩阵 完成两个相机矩阵
- 用triangulation算出点的位置
- 加点/相机
	- 对于相机 利用已知点完成calibration
	- 对于点 使用triangulation
- 不断扩展模型
但是如果只是不断的添加相机 会导致模型的扭曲 偏移 因此我们使用bundle adjustment
## Photo tourism 一个代表性的SfM管线
- 挑一对inliers多的图做初始化  双视图SFM  以及如果prefer的EXIF data(照片拍摄时的一些信息)
	- 用EXIF估计内参  并用5点法完成E矩阵以及R t的计算
	- 使用triangulation完成模型中点的估计
- 对于剩余的图
	- 找到inliers数最多的图
	- 用RANSAC 注册这张图 即找到feature match
	- 三角化新点，
	- 定期做全局 bundle adjustment；
