---
number: 2
title: "2 角色驱动：关节力矩、PD 控制与平衡"
subject: 角色动画与运动仿真
date: 2026-05-16
---

# 角色驱动：关节力矩、PD 控制与平衡

> [!tip] 学习指南
> 本节核心：在 Lec 08 已建立的"被动 ragdoll 仿真"之上，给角色装上"肌肉"——以**关节力矩 $\boldsymbol{\tau}$** 为执行器，由控制器 $\pi$ 决定，把动作生成问题转化为"什么时候、对哪个关节、施加多大力矩"。
> 前置知识：Lec 08 Newton–Euler 方程 $M\dot{\boldsymbol v}+C(\boldsymbol x,\boldsymbol v)=\boldsymbol f+J^T\lambda$；Lec 03 雅可比矩阵 / FK；半隐式 Euler。
> 重点关注：① **极大坐标 vs. 广义坐标** 两种描述 ② **力 ↔ 力矩** 在自由刚体上的等价性 ③ 关节力矩"正反一对"的作用方式 ④ 正/逆动力学的二元性 ⑤ **PD / Stable PD** 控制律及其稳定性 ⑥ **Jacobian Transpose** 把"虚拟力"映射回关节力矩 ⑦ 静态平衡的 CoM / 支撑多边形 / 踝-髋策略。

## 0. 核心问题 / Motivation

Lec 08 给了我们一台"物理仿真器"：输入 $(\boldsymbol x_t, \boldsymbol v_t, R_t, \boldsymbol\omega_t)$ + 所有外力，输出下一帧状态。但只有**重力**和**接触**的角色就是一个 ragdoll——它会摔倒。要让角色"自己动"，必须有一个"控制器" $\pi$ 把当前状态映射成**主动力 / 力矩**，再喂给仿真器：

$$\boxed{\pi:\ (\boldsymbol s_t,t)\ \longmapsto\ (\boldsymbol f,\boldsymbol\tau)\quad\text{Joint torques}}$$

本节回答：

1. 主动驱动应该写在哪一层？为什么是**关节力矩** $\boldsymbol\tau$？
2. 给定一对相连刚体，$\boldsymbol\tau$ 在 Newton–Euler 方程里如何加入？
3. 角色动力学有两种坐标（极大坐标 / 广义坐标）——它们各自的代价是什么？
4. 正动力学（$\boldsymbol f\!\to\!\dot{\boldsymbol v}$）与逆动力学（$\dot{\boldsymbol v}\!\to\!\boldsymbol f$）如何互为镜像？
5. 最简单的反馈控制律——**PD 控制**——稳定吗？大 $k_p$ 为何爆炸？
6. 如何只用关节力矩"模仿"作用在末端的"虚拟力"（虚拟模型控制 / Jacobian Transpose）？
7. 站立时为何要把投影 CoM 拉到支撑多边形中心？

## 1. 从仿真到驱动：极大坐标与广义坐标

### 1.1 单刚体回顾（Lec 08 浓缩）

线性：$\dot{\boldsymbol p}=\boldsymbol f$，$\boldsymbol p=m\boldsymbol v$；角向：$\dot{\boldsymbol L}=\boldsymbol\tau$，$\boldsymbol L=I\boldsymbol\omega$。合写为 Newton–Euler：

$$\begin{bmatrix}mI_3 & 0\\ 0 & I\end{bmatrix}\!\begin{bmatrix}\dot{\boldsymbol v}\\ \dot{\boldsymbol\omega}\end{bmatrix}+\begin{bmatrix}0\\ \boldsymbol\omega\times I\boldsymbol\omega\end{bmatrix}=\begin{bmatrix}\boldsymbol f\\ \boldsymbol\tau\end{bmatrix}$$

铰接刚体（Lec 08 §4.4）：

$$M\dot{\boldsymbol v}+C(\boldsymbol x,\boldsymbol v)=\boldsymbol f+J^T\boldsymbol\lambda,\qquad J\boldsymbol v=0$$

> [!note] 一帧仿真步骤（Lec 08 复盘）
> ① 检测碰撞与接触 → ② 装配 $J,b$ → ③ PGS 求 $\boldsymbol\lambda$（含关节/接触/摩擦） → ④ $\boldsymbol v_{n+1}$ 半隐式更新 → ⑤ $\boldsymbol x_{n+1}=\boldsymbol x_n+h\boldsymbol v_{n+1}$、$q_{n+1}=q_n+\tfrac{h}{2}\bar{\boldsymbol\omega}_{n+1}q_n$（四元数归一化）。

### 1.2 两种坐标系：Maximized vs. Generalized

| 坐标系 | 状态 | 维度 | 关节如何体现 |
|--------|------|------|------------|
| **极大坐标 (Maximized)** | 每个 link 独立 $(\boldsymbol x_i,Q_i,\boldsymbol v_i,\boldsymbol\omega_i)$ | $13N$ 个变量 | 约束 $J\boldsymbol v=0$ + Lagrange 乘子 $\boldsymbol\lambda$ |
| **广义坐标 (Generalized)** | 关节角 $\boldsymbol\theta=(\theta_0,\theta_1,\dots)$ | 等于 DoF | 自动满足（直接参数化） |

> [!example] 一条链的广义→极大映射（Forward Kinematics）
> 设 link $i$ 的局部转轴 $\boldsymbol u_i$、关节角 $\theta_i$，记 $Q_i=Q_{i-1} R(\theta_i\boldsymbol u_i)$（沿链累乘）：
>
> $$\boldsymbol x_i=\boldsymbol x_{i-1}+Q_{i-1}\boldsymbol d_{i-1}+Q_i\boldsymbol l_i$$
>
> 其中 $\boldsymbol l_i$ 是 link $i$ 局部系下从关节到质心的偏移，$\boldsymbol d_{i-1}$ 是 link $i-1$ 质心到下一关节的偏移。

速度递推：
$$\boldsymbol\omega_i=\boldsymbol\omega_{i-1}+Q_{i-1}\dot\theta_i\boldsymbol u_i,\qquad \boldsymbol v_i=\boldsymbol v_{i-1}+\boldsymbol\omega_{i-1}\times Q_{i-1}\boldsymbol d_{i-1}+\boldsymbol\omega_i\times Q_i\boldsymbol l_i$$

加速度递推（再次对时间求导）：
$$\dot{\boldsymbol\omega}_i=\dot{\boldsymbol\omega}_{i-1}+\boldsymbol\omega_{i-1}\!\times\! Q_{i-1}\dot\theta_i\boldsymbol u_i+Q_{i-1}\ddot\theta_i\boldsymbol u_i$$
$$\dot{\boldsymbol v}_i=\dot{\boldsymbol v}_{i-1}+\dot{\boldsymbol\omega}_{i-1}\!\times\! Q_{i-1}\boldsymbol d_{i-1}+\boldsymbol\omega_{i-1}\!\times\!(\boldsymbol\omega_{i-1}\!\times\! Q_{i-1}\boldsymbol d_{i-1})+\dot{\boldsymbol\omega}_i\!\times\! Q_i\boldsymbol l_i+\boldsymbol\omega_i\!\times\!(\boldsymbol\omega_i\!\times\! Q_i\boldsymbol l_i)$$

> [!note] 矩阵化
> 把链路上所有 $(\boldsymbol\omega_i,\boldsymbol v_i)$ 写成对 $\dot{\boldsymbol\theta}$ 的线性映射：
> $$\boldsymbol\omega_i=J_i^{\omega}(\boldsymbol\theta)\dot{\boldsymbol\theta},\quad \boldsymbol v_i=J_i^{v}(\boldsymbol\theta)\dot{\boldsymbol\theta}$$
> $$\dot{\boldsymbol\omega}_i=J_i^{\omega}\ddot{\boldsymbol\theta}+\dot{\boldsymbol\theta}^T H_i^{\omega}\dot{\boldsymbol\theta},\quad \dot{\boldsymbol v}_i=J_i^{v}\ddot{\boldsymbol\theta}+\dot{\boldsymbol\theta}^T H_i^{v}\dot{\boldsymbol\theta}$$
> 其中 $H_i$ 是 Hessian 项（二次速度耦合）。这正是为什么"广义坐标 + 加速度"涉及的非线性项很多——但变量数最少。

### 1.3 角色的根关节

人形角色没有"机座"——根关节（pelvis）是漂在空间里的 6-DoF 自由体：

$$\boldsymbol\theta=(\boldsymbol t_0,\boldsymbol\theta_0,\boldsymbol\theta_1,\dots),\quad\dot{\boldsymbol\theta}=(\boldsymbol v_0,\boldsymbol\omega_0,\omega_1,\dots),\quad \ddot{\boldsymbol\theta}=(\dot{\boldsymbol v}_0,\dot{\boldsymbol\omega}_0,\dot\omega_1,\dots)$$

> [!warning] 这就是为什么人形角色"欠驱动 (underactuated)"
> 6 个根 DoF 没有对应的电机——靠脚下接触力间接控制。下面 §3.3 会反复看到这一点。

## 2. 力 vs. 力矩：施加位置的等价变换

### 2.1 自由刚体上：单一外力的等效

一个外力 $\boldsymbol f$ 作用在刚体上的 $\boldsymbol r_f$ 点（相对质心）：

$$\begin{bmatrix}\dot{\boldsymbol v}\\ \dot{\boldsymbol\omega}\end{bmatrix}\ \leftarrow\ \begin{bmatrix}\boldsymbol f\\ \boldsymbol\tau+\boldsymbol r_f\times\boldsymbol f\end{bmatrix}$$

> [!example] 力偶 (couple)
> 两个**等大反向**作用在不同点的力：$\boldsymbol f$ 在 $\boldsymbol r_1$、$-\boldsymbol f$ 在 $\boldsymbol r_2$。合力 $=0$，合力矩 $=\boldsymbol r_1\times\boldsymbol f+\boldsymbol r_2\times(-\boldsymbol f)=(\boldsymbol r_1-\boldsymbol r_2)\times\boldsymbol f$。**对任意参考点都相同**——纯力偶完全由力矩描述。

这就是"力矩"在动力学上的真正含义：可以无视具体施力位置。

### 2.2 关节内部力的本性

回到两刚体共用关节 $\boldsymbol x_J$。**关节本身是无质量的**——它不能存储动量，也不能"凭空生成"净力。设内部有任意作用力集合 $\{\boldsymbol f_i\}$：

$$\sum_i\boldsymbol f_i=\boldsymbol 0\qquad\text{（关节净外力为 0）}$$

但作用在 link 1、link 2 上的**力矩**不一定为零：

$$\boldsymbol\tau_1=\sum_i(\boldsymbol r_1+\boldsymbol r_i)\times\boldsymbol f_i=\boldsymbol r_1\times\Big(\sum_i\boldsymbol f_i\Big)+\sum_i\boldsymbol r_i\times\boldsymbol f_i=\sum_i\boldsymbol r_i\times\boldsymbol f_i$$

$$\boldsymbol\tau_2=\sum_i(\boldsymbol r_2+\boldsymbol r_i)\times(-\boldsymbol f_i)=-\sum_i\boldsymbol r_i\times\boldsymbol f_i=-\boldsymbol\tau_1$$

> [!note] 关节力矩 = 一对反向力偶
> 把内部细节抽象掉后：
> $$\boxed{\boldsymbol\tau_1=\boldsymbol\tau,\qquad \boldsymbol\tau_2=-\boldsymbol\tau}$$
>
> 实现一个"关节力矩 $\boldsymbol\tau$"只需要：**对子刚体加 $\boldsymbol\tau$，对父刚体加 $-\boldsymbol\tau$**。

带关节力矩的两刚体运动方程：

$$\begin{bmatrix}m_1 I_3 & & & \\ & I_1 & & \\ & & m_2 I_3 & \\ & & & I_2\end{bmatrix}\!\begin{bmatrix}\dot{\boldsymbol v}_1\\ \dot{\boldsymbol\omega}_1\\ \dot{\boldsymbol v}_2\\ \dot{\boldsymbol\omega}_2\end{bmatrix}+\begin{bmatrix}0\\ \boldsymbol\omega_1\!\times\! I_1\boldsymbol\omega_1\\ 0\\ \boldsymbol\omega_2\!\times\! I_2\boldsymbol\omega_2\end{bmatrix}=\begin{bmatrix}\boldsymbol 0\\ \boldsymbol\tau\\ \boldsymbol 0\\ -\boldsymbol\tau\end{bmatrix}+J^T\boldsymbol\lambda,\qquad J\boldsymbol v=0$$

净外力为 0 (动量守恒)，净外力矩对 system 也为 0 (角动量守恒)——角色没法靠**内部力矩**起飞。

### 2.3 全身控制器接口

```
状态 (x_t, v_t, R_t, ω_t)
       │
       ▼
  Controller  π(s_t, t)  →  per-joint τ_k
       │
       ▼
[For each joint k]: apply +τ_k to child, -τ_k to parent
       │
       ▼
  Dynamic Simulator  (Lec 08 pipeline)
       │
       ▼
  Next state (x_{t+1}, v_{t+1}, R_{t+1}, ω_{t+1})
```

> [!warning] Underactuated vs. Fully-actuated
> - **Fully-actuated**：执行器数 ≥ DoF；任意 $(\boldsymbol x,\boldsymbol v,\dot{\boldsymbol v})$ 都能找到 $\boldsymbol f$ 实现（如工业机械臂带固定基座）。
> - **Underactuated**：执行器数 < DoF；许多 $(\boldsymbol x,\boldsymbol v,\dot{\boldsymbol v})$ 无解（如人形：根的 6 DoF 没有电机）。
>
> 人形角色之所以难，本质就是**欠驱动**——你不能直接命令骨盆"立刻向上加速 2 m/s²"，只能通过腿—脚—地面接触链间接产生。

## 3. 正动力学 vs. 逆动力学

### 3.1 二元定义

运动方程 $M\dot{\boldsymbol v}+C=\boldsymbol f+J^T\boldsymbol\lambda$ 提供了 $(\boldsymbol x,\boldsymbol v,\boldsymbol f,\dot{\boldsymbol v})$ 之间的关系。

| | 输入 | 输出 | 用途 |
|---|---|---|---|
| **Forward dynamics (FD)** | $\boldsymbol x,\boldsymbol v,\boldsymbol f$ | $\dot{\boldsymbol v}$ | 仿真器 (Lec 08) |
| **Inverse dynamics (ID)** | $\boldsymbol x,\boldsymbol v,\dot{\boldsymbol v}$ | $\boldsymbol f,\boldsymbol\tau$ | 控制器 |

形式上：
$$\boxed{\boldsymbol f=M\dot{\boldsymbol v}+C(\boldsymbol x,\boldsymbol v)-J^T\boldsymbol\lambda}$$
给定期望加速度，反推驱动力。

### 3.2 Recursive Newton–Euler Algorithm (RNEA)

对铰接链 ID 的经典 $O(N)$ 算法：

> [!example] RNEA 两个 pass
> **前向 pass**（root → tip，从广义坐标算极大坐标的运动学）：
> $$Q_i,\boldsymbol x_i,\boldsymbol\omega_i,\boldsymbol v_i,\dot{\boldsymbol\omega}_i,\dot{\boldsymbol v}_i\ \text{用 §1.2 公式逐 link 累乘}$$
>
> **后向 pass**（tip → root，逐 link 写 NE 方程解 $\boldsymbol f_i,\boldsymbol\tau_i$）：
> $$m_i\dot{\boldsymbol v}_i=\boldsymbol f_i-\sum_{k\in c_i}\boldsymbol f_k+\sum_j\boldsymbol f_j^{\text{ext}}$$
> $$I_i\dot{\boldsymbol\omega}_i+\boldsymbol\omega_i\!\times\! I_i\boldsymbol\omega_i=\boldsymbol\tau_i+\boldsymbol r_i\!\times\!\boldsymbol f_i-\sum_{k\in c_i}\big(\boldsymbol\tau_k+\boldsymbol d_{ik}\!\times\!\boldsymbol f_k\big)+\sum_j\boldsymbol\tau_j^{\text{ext}}$$
>
> 其中 $c_i$ 是 link $i$ 的子链路集合；$\boldsymbol f_k,\boldsymbol\tau_k$ 是子链 $k$ 通过关节作用在 $i$ 上的反作用（牛顿第三定律）。

### 3.3 示例：重力补偿 (Gravity Compensation)

> [!example] 三段串行 link，全身静止：$\dot{\boldsymbol v}_i=\boldsymbol 0,\dot{\boldsymbol\omega}_i=\boldsymbol 0$
>
> **Tip (link 3)**：$\boldsymbol 0=\boldsymbol f_3-m_3\boldsymbol g\Rightarrow \boldsymbol f_3=-m_3\boldsymbol g$，$\boldsymbol\tau_3=\boldsymbol r_3\times m_3\boldsymbol g$。
>
> **Link 2**（要承担 link 3 的反作用 $\boldsymbol f_3,\boldsymbol\tau_3$）：
> $\boldsymbol f_2=-m_2\boldsymbol g-m_3\boldsymbol g$。
>
> **Link 1**：$\boldsymbol f_1=-(m_1+m_2+m_3)\boldsymbol g$（每段都要往上"撑住"上方所有质量）。
>
> 用 **Jacobian Transpose** 视角（见 §4.3）可一次性写出：
> $$\boldsymbol\tau_1=(\boldsymbol x_1-\boldsymbol o)\!\times\!(-m_1\boldsymbol g)+(\boldsymbol x_2-\boldsymbol o)\!\times\!(-m_2\boldsymbol g)+(\boldsymbol x_3-\boldsymbol o)\!\times\!(-m_3\boldsymbol g)$$
> $$\boldsymbol\tau_2=(\boldsymbol x_2-\boldsymbol p_2)\!\times\!(-m_2\boldsymbol g)+(\boldsymbol x_3-\boldsymbol p_2)\!\times\!(-m_3\boldsymbol g),\quad \boldsymbol\tau_3=(\boldsymbol x_3-\boldsymbol p_3)\!\times\!(-m_3\boldsymbol g)$$

## 4. PD 控制：最简的反馈律

### 4.1 闭环 vs. 开环

> [!note] Feedforward / Open-loop
> $(\boldsymbol f,\boldsymbol\tau)=\pi(t)$：与状态无关，照本宣科。任何扰动都会让结果偏离预期。
>
> ### Feedback / Closed-loop
> $(\boldsymbol f,\boldsymbol\tau)=\pi(\boldsymbol s_t,t)$：根据当前状态修正。**能抵抗一定扰动**，是真实物理控制的标配。

### 4.2 P 控制：弹簧

让质点从 $x$ 移到目标 $\bar x$：
$$f=k_p(\bar x-x)=k_p\,e,\qquad e=\bar x-x$$
$k_p$ 越大，刚度越高，越快收敛。但纯 P 在重力下有**稳态误差** $e_0$：
$$k_p e_0=mg\Rightarrow e_0=\frac{mg}{k_p}$$
增大 $k_p$ 减小 $e_0$，但越大越容易数值发散。

### 4.3 PD 控制：弹簧 + 阻尼

加阻尼项：
$$\boxed{f=k_p(\bar x-x)+k_d(\dot{\bar x}-\dot x)=k_p e+k_d\dot e}$$
在角色场景里 $\dot{\bar q}$ 常取 0：

$$\boxed{\boldsymbol\tau=k_p(\bar{\boldsymbol q}-\boldsymbol q)-k_d\dot{\boldsymbol q}}$$

> [!warning] PID 中的 I 项
> $f=k_p e+k_d\dot e+k_i\int_t e\,dt$。积分项专门消除稳态误差，但在角色动画里**很少用**——它会引入记忆和过冲，调起来烦。重力补偿一般直接用 ID 求解。

### 4.4 PD 在角色上的应用

每个关节有自己的 $(\bar q_j,k_p,k_d)$，独立计算 $\boldsymbol\tau_j$：

- 小 $k_p$ → "软"角色，跟踪迟缓、迟钝
- 大 $k_p$ → "硬"角色，跟踪精准但易抖动 / 发散
- 小 $k_d$ → 振荡明显
- 大 $k_d$ → 阻尼过强、动作"黏稠"

> [!note] 典型经验值（50 kg 角色）
> $k_p=200,\ k_d=20$，仿真步长 $h=0.5\sim 1$ ms（$1000\sim 2000$ Hz）。
> 经验法则：**轻 link 减小 gain；动态动作加大 gain；高 gain 必须配合更小 $h$**。

### 4.5 PD 的稳定性分析

考虑一维 $f=-k_p x-k_d v$（无重力，$m=1$）。半隐式 Euler：

$$\begin{bmatrix}v_{n+1}\\ x_{n+1}\end{bmatrix}=\underbrace{\begin{bmatrix}1-k_d h & -k_p h\\ h(1-k_d h) & 1-k_p h^2\end{bmatrix}}_{A}\begin{bmatrix}v_n\\ x_n\end{bmatrix}$$

$$\boldsymbol s_{n+1}=A\boldsymbol s_n=A^n\boldsymbol s_1$$

对 $A$ 特征分解 $A=P\,\text{diag}(\lambda_1,\lambda_2)\,P^{-1}$，记 $\boldsymbol z=P^{-1}\boldsymbol s$：

$$\boldsymbol z_{n+1}=\text{diag}(\lambda_1,\lambda_2)\boldsymbol z_n\Rightarrow \boldsymbol z_n=\text{diag}(\lambda_1^n,\lambda_2^n)\boldsymbol z_1$$

> [!warning] 稳定条件
> $$\boxed{|\lambda_i|\le 1\ \forall i}$$
> 任一 $|\lambda_i|>1$ → 指数发散。
>
> $A$ 的特征值依赖 $(k_p,k_d,h)$。**$k_p$ 越大、$h$ 越大 → 越容易越界**。

### 4.6 Stable PD Control (Tan et al. 2011)

把 PD 的 $v$ 写成"下一帧"——**对阻尼项隐式化**：

$$v_{n+1}=v_n+h\big(-k_p x_n-k_d v_{n+1}\big)$$

显式解：
$$v_{n+1}=\frac{v_n-h k_p x_n}{1+h k_d},\quad x_{n+1}=x_n+h v_{n+1}$$

整体格式（$m=1$）：
$$\begin{bmatrix}v_{n+1}\\ x_{n+1}\end{bmatrix}=\frac{1}{1+h k_d}\begin{bmatrix}1 & -k_p h\\ h & 1+k_d h-k_p h^2\end{bmatrix}\begin{bmatrix}v_n\\ x_n\end{bmatrix}$$

> [!note] 收益
> 对阻尼项隐式化使系统对 $k_d$ **无条件稳定**，对 $k_p$ 的容忍度也大幅提升。Stable PD 让 $h$ 可以放宽到 $\sim 1/120\!\sim\! 1/60$ s（120 / 60 Hz），从而**与渲染同步**，工程价值巨大。
>
> 真正版本（多 DoF）需在每步局部线性化整套铰接动力学 → 解 $O(N)$ 线性方程组。

## 5. Jacobian Transpose Control（虚拟力控制）

### 5.1 问题：把"末端目标力"翻译成关节力矩

想象在末端 $\boldsymbol x$（如手）上施加一个"虚拟力" $\boldsymbol f$（不真存在），希望靠关节力矩 $\boldsymbol\tau$ 重现同样的瞬时效果（同样的功率）。

### 5.2 功率匹配 → 雅可比转置

末端速度 $\dot{\boldsymbol x}=J\dot{\boldsymbol\theta}$（Lec 03 FK 雅可比，$J=\partial g/\partial\boldsymbol\theta$）。

外力 $\boldsymbol f$ 在末端做的功率 $=$ 关节力矩 $\boldsymbol\tau$ 在所有关节做的功率：

$$\boldsymbol f^T\dot{\boldsymbol x}=\boldsymbol\tau^T\dot{\boldsymbol\theta}\quad\Longleftrightarrow\quad \boldsymbol f^T J\dot{\boldsymbol\theta}=\boldsymbol\tau^T\dot{\boldsymbol\theta},\ \forall\dot{\boldsymbol\theta}$$

$$\boxed{\boldsymbol\tau=J^T\boldsymbol f}$$

### 5.3 几何解读：每个 hinge 关节

对 hinge 关节 $i$（轴向 $\boldsymbol a_i$，从关节到末端的偏移 $\boldsymbol r_i$）：
$$\frac{\partial g}{\partial\theta_i}=\boldsymbol a_i\times\boldsymbol r_i$$

代入：
$$\tau_i=\big(\boldsymbol a_i\times\boldsymbol r_i\big)\cdot\boldsymbol f=\boldsymbol a_i\cdot(\boldsymbol r_i\times\boldsymbol f)$$

对一般 ball joint：
$$\boxed{\boldsymbol\tau_i=(\boldsymbol x-\boldsymbol p_i)\times\boldsymbol f}\qquad (\boldsymbol p_i:\text{第 }i\text{ 个关节位置})$$
即把虚拟力**关于关节点的力矩**当作关节力矩。

### 5.4 应用

> [!example] 虚拟力 + Jacobian Transpose 的典型用法
> 1. **平衡的辅助力**：往 CoM 推一个虚拟力 $\boldsymbol f_{\text{CoM}}$，再用腿/脚关节的 $J^T$ 翻译成关节力矩。
> 2. **末端跟踪**：手要跟目标 $\bar{\boldsymbol x}$ → $\boldsymbol f=k_p(\bar{\boldsymbol x}-\boldsymbol x)-k_d\dot{\boldsymbol x}$，再 $\boldsymbol\tau=J^T\boldsymbol f$。
> 3. **重力补偿**：$\boldsymbol f=-m\boldsymbol g$ 作用在每个 link 的质心，沿链 $J^T$ 累加。

## 6. 跟踪控制：让角色"跳舞"

### 6.1 全身 Tracking Controller

每个关节 $j$ 独立 PD：
$$\boldsymbol\tau_j=k_p(\bar{\boldsymbol q}_j-\boldsymbol q_j)-k_d\dot{\boldsymbol q}_j$$

目标 $\bar{\boldsymbol q}(t)$ 来自：① mocap 序列；② 关键帧；③ 手编 FSM；④ 抽象模型（如 IPM）+ IK。

> [!example] 经典工作
> - **Hodgins & Wooten 1995** "Animating Human Athletics"：手编关节轨迹 + PD 完成跳水、骑车、跑步。
> - **NaturalMotion Endorphin**：把关键帧动画交给物理跟踪，做"会受力反应"的角色。
> - **SAMCON (Liu et al. 2010)**：把 mocap 切片，**采样多条扰动 PD 轨迹**再用 MCTS 拼成稳定 tracking。

### 6.2 PD 是 feedforward 还是 feedback？

PD 中"$\bar q$"是 feedforward 指令；"$-k_p q-k_d\dot q$"是 feedback 修正。所以——**两者都是**，只是反馈环路简单。

### 6.3 PD 的固有问题

- **稳态误差**：手臂在重力下永远到不了目标角度（除非加 I 项或 ID 补偿）。
- **滞后**：跟踪 mocap 时仿真轨迹永远滞后参考一个相位。
- 大 $k_p$ 精度高但不稳定（§4.5）；小 $k_p$ 稳定但跟不上。

### 6.4 Residual Force / Torque：作弊但好用

> [!warning] 残差力的合法性
> 角色腰部（root link）本不应有外力。但工程里常额外加一对 $(\boldsymbol f_0,\boldsymbol\tau_0)$ 给 root，称为**残差力 / 残差力矩 (residual force/torque)**。
>
> 优点：消除跟踪误差，让 mocap 跟踪极其稳健。
> 代价：**违背动量守恒**——总外力净不为零。
> 用法：物理插值动画（如 Zordan et al. 2005）、训练 RL 时作辅助；"展示动画"接受这种作弊。

## 7. 静态平衡 (Static Balance)

### 7.1 平衡的几何定义

> [!note] CoM / Support Polygon
> - **Center of Mass (CoM)** $\boldsymbol c=\sum m_i\boldsymbol x_i/M$：质心位置。
> - **Projected CoM** $\boldsymbol c_\perp$：CoM 向地平面的垂直投影。
> - **Support Polygon**：地面与角色接触点（脚底、手等）的**凸包**。
>
> **静态平衡**：$\boldsymbol c_\perp$ 落在 support polygon 内部。

落在外部 → 角色翻倒。"落在边界" 是临界稳定。

### 7.2 简单平衡策略

> [!example] 三步骤
> 1. 设目标 $\bar{\boldsymbol c}=$ 支撑多边形中心。
> 2. PD 反馈力矩：
> $$\boldsymbol\tau=k_p(\bar{\boldsymbol c}-\boldsymbol c)-k_d\dot{\boldsymbol c}$$
> 3. 应用在**踝关节**（ankle strategy）或**髋关节**（hip strategy）。

或者用**虚拟力 + Jacobian Transpose**：先算 CoM 上需要的水平校正力
$$\boldsymbol f=k_p(\bar{\boldsymbol c}-\boldsymbol c)-k_d\dot{\boldsymbol c}$$
再用腿上各关节 $\boldsymbol\tau_i=(\boldsymbol c-\boldsymbol p_i)\times\boldsymbol f$ 翻译成关节力矩——这就是"Virtual Model Control"。

### 7.3 高级策略：Momentum Control

Macchietto et al. 2009 *"Momentum Control for Balance"*：

> [!example] 单步 QP
> 把"目标 CoM 加速度 + 目标角动量"放入二次规划：
> $$\min_{\boldsymbol\tau,\boldsymbol\lambda}\ \|M\dot{\boldsymbol v}_{\text{des}}-(M\dot{\boldsymbol v}+C-\boldsymbol\tau\!\circ\!\boldsymbol e-J^T\boldsymbol\lambda)\|^2+w\|\boldsymbol\tau\|^2$$
> 约束：接触力在摩擦锥内、关节力矩饱和、跟踪 mocap。
>
> 在每个仿真步求解。跟纯 PD 比，可以"主动调度"上下肢的角动量贡献，跌倒前能伸臂、屈膝等。

### 7.4 踝策略 vs. 髋策略

- **Ankle strategy**：微小扰动，只动踝关节，整身像一根杆子前后摇摆。
- **Hip strategy**：扰动较大，髋关节屈伸来重新分配角动量。
- **Stepping strategy**：进一步——迈步重置支撑多边形（→ 进入 Lec 10 动态平衡）。

## 9. 工程要点速记

> [!tip] 实现细节备忘
> - **力矩单位**：$N\cdot m$；50 kg 角色髋关节峰值 $\sim 200\,N\!\cdot\!m$。
> - **关节力矩限幅**：必加上电机/肌肉饱和（如 $|\tau|\le\tau_{\max}$），否则容易 PD 爆出非物理力矩。
> - **PD 的 $k_d$ 不能用临界阻尼公式硬套**：在多刚体耦合下"等效质量"会变。经验是先调 $k_p$ 再扫 $k_d=\eta\sqrt{k_p}$，$\eta\in[0.1,0.5]$。
> - **目标姿态 $\bar q$ 必须是关节局部角**（相对父 link），不是世界角；否则 PD 会和 root 旋转耦合。
> - **Residual force**：训练 RL 时常常关掉以保证 sim-to-real 可行；做电影动画时开启换稳定性。
> - **接触状态机**：站立/支撑/摆动腿的 PD gain 不同；摆动腿需放软 $k_p$ 避免"踢到地"产生大冲量。

## 记号速查

| 符号 | 含义 |
|------|------|
| $\boldsymbol\theta,\dot{\boldsymbol\theta},\ddot{\boldsymbol\theta}$ | 广义坐标位姿 / 速度 / 加速度 |
| $\boldsymbol q,\dot{\boldsymbol q}$ | 关节角 / 角速度（同 $\boldsymbol\theta$） |
| $\bar{\boldsymbol q},\dot{\bar{\boldsymbol q}}$ | 目标关节角 / 角速度 |
| $\boldsymbol u_i,\boldsymbol l_i,\boldsymbol d_i$ | link $i$ 局部转轴 / 关节→质心偏移 / 质心→下关节偏移 |
| $Q_i,\boldsymbol x_i,\boldsymbol v_i,\boldsymbol\omega_i$ | link $i$ 极大坐标姿态、位置、速度、角速度 |
| $J,J^T$ | 雅可比；$J^T\boldsymbol f$ 把末端力翻译成关节力矩 |
| $J_i^\omega,J_i^v,H_i$ | 角/线速度雅可比 + 二阶 Hessian 项 |
| $\boldsymbol\tau,\boldsymbol\tau_1=-\boldsymbol\tau_2$ | 关节力矩 / 一对反向施力 |
| $\boldsymbol f_j^{\text{ext}},\boldsymbol\tau_j^{\text{ext}}$ | link 上的外力 / 外力矩（接触、重力等）|
| $\boldsymbol f_0,\boldsymbol\tau_0$ | Residual root force / torque |
| $k_p,k_d,k_i$ | PD/PID 比例 / 微分 / 积分系数 |
| $e,\dot e$ | PD 误差 $\bar x-x$、误差导数 |
| $\boldsymbol c,\bar{\boldsymbol c}$ | CoM 当前 / 目标位置 |
| $h$ | 仿真步长 |
| $\boldsymbol s,\pi$ | 控制器状态、控制策略 |

## 10. 与上下游课的衔接

> [!note] 课程脉络上的位置
> - **从 Lec 08（被动仿真）**继承所有动力学方程。
> - **从 Lec 03**继承 FK / Jacobian。
> - **向 Lec 10（Learning to Walk）**输出：踝/髋静态平衡 + Stable PD 已足够站立，但**走路是连续的失衡**——必须迈步，引入 ZMP、Inverted Pendulum、SIMBICON 等动态平衡机制。
> - **向 Lec 06（Learning-based）**输出：PD 是 RL 中"动作空间"的标配——策略网络输出 $\bar q$，再由 PD 转 $\boldsymbol\tau$；DeepMimic / AMP 都基于此。

> [!tip] 期中复习要点
> 1. **极大 vs. 广义坐标**：维度、约束处理、典型 ID 算法 (RNEA) 是否用得上。
> 2. **关节力矩的施加方式**：为何"对子刚体加 $\boldsymbol\tau$、对父刚体加 $-\boldsymbol\tau$"？把它写进 NE 方程能体现什么物理量守恒？
> 3. **FD vs. ID**：能写出 $\boldsymbol f=M\dot{\boldsymbol v}+C-J^T\boldsymbol\lambda$ 并解释为什么"角色站不直"问题要在 ID 里加重力补偿项。
> 4. **PD 稳定性**：从矩阵 $A$ 的 $|\lambda|\le 1$ 出发，解释为什么 stable PD 中"对 $v$ 隐式化"会显著扩大稳定区。
> 5. **Jacobian Transpose**：从 $\boldsymbol f^T\dot{\boldsymbol x}=\boldsymbol\tau^T\dot{\boldsymbol\theta}$ 推 $\boldsymbol\tau=J^T\boldsymbol f$，能写出 hinge 关节的 $\tau_i=(\boldsymbol x-\boldsymbol p_i)\!\cdot\!(\boldsymbol a_i\times\boldsymbol f)$ 形式。
> 6. **静态平衡**：CoM、support polygon、ankle vs. hip strategy 三个概念加上 momentum control 的 QP 思路。
> 7. **Residual force 的争议**：什么时候用、违背了什么、与 RL 训练的关系。
