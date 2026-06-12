---
title: 3 Learning to Walk：动态平衡与简化模型
date: "2026-05-16"
number: 3
categories:
  - 课程笔记
  - 角色动画与运动仿真
tags:
  - 角色动画与运动仿真
permalink: /notes/角色动画与运动仿真/3 Learning to Walk：动态平衡与简化模型/
banner_img: /images/banners/gallery/landscape-027-file-2011-08-01-10-31-42-switzerland-segl-.jpg
category_bar: true
math: true
---

# Learning to Walk：动态平衡与简化模型

> [!tip] 学习指南
> 本节核心：走路 = **连续可控的失衡 + 步伐规划**。静态平衡（Lec 09）让角色"立得住"，但只要 CoM 投影离开支撑多边形，就需要**迈步重置支撑区**。本节用三类经典简化模型分析迈步逻辑：① ZMP（零力矩点）作为脚不翻转的判据；② Linear Inverted Pendulum Model (LIPM) 把走路抽象为一根倒立摆；③ Cart-Table 模型把"给定 ZMP 反求 CoM"转化为三对角线性系统。最后用 SIMBICON 把这些原理压成一个 4 状态 FSM 上工。
> 前置知识：Lec 08 多体动力学 + 接触力；Lec 09 CoM、support polygon、PD、Jacobian Transpose、关节力矩。
> 重点关注：① 单 / 双支撑相的几何 ② 静态平衡为何不足以走路 ③ ZMP 的力学定义与"在支撑多边形内"等价于脚不翻转 ④ LIPM 微分方程 $\ddot x=\tfrac{g}{z}(x-x_{\text{zmp}})$ 与守恒能量 ⑤ Cart-Table preview control ⑥ SIMBICON 的 FSM + linear feedback。

## 0. 核心问题 / Motivation

> [!note] 静态 vs. 动态平衡
> - **静态平衡 (Static balance)**：投影 CoM 在支撑多边形内，**速度 = 0**。
> - **动态平衡 (Dynamic balance)**：投影 CoM 可以**瞬时离开**多边形，只要在系统重新跌倒之前**迈步**重置支撑区。

为什么需要新的工具？Lec 09 末尾的 ankle / hip strategy 假设角色脚一直贴地。但走路本质上：

```
Single Stance ── Double Stance ── Single Stance ── …
左脚撑     右脚抬起 / 落下     右脚撑
```

- **Single stance phase**：只有一只脚接地，support polygon = 一只脚。
- **Double stance phase**：两脚同时接地，support polygon = 两脚之间的凸包。
- **Flight phase**（跑步、跳跃）：双脚离地 → 没有 GRF → 只能靠空中角动量。

> [!warning] 静态平衡走路 vs. 动态平衡走路
> 慢速"静态平衡走路"——每一帧 CoM 投影都被强行控制在 polygon 内——是 ASIMO 早期演示的姿态：步幅小、僵硬、能量低。
> 真正像人的走路：CoM 大部分时间**位于支撑多边形外**——只在 double stance 短暂回到内部。

## 1. 零力矩点 ZMP：脚不翻转的判据

### 1.1 直观图景

设角色单脚站立。脚底每个接触点 $\boldsymbol p_i$ 给出反作用力 $\boldsymbol f_i$（法向 + 摩擦）：
$$\boldsymbol f_i=\boldsymbol f_i^y+\boldsymbol f_i^{xz}\quad(\boldsymbol f_i^y\!:\text{竖直分量},\ \boldsymbol f_i^{xz}\!:\text{水平分量})$$

合 GRF 与对参考点 $\boldsymbol p$ 的总力矩：
$$\boldsymbol f_{\text{GRF}}=\sum_i\boldsymbol f_i,\qquad \boldsymbol\tau_{\text{GRF}}(\boldsymbol p)=\sum_i(\boldsymbol p_i-\boldsymbol p)\times\boldsymbol f_i$$

### 1.2 拆水平 / 竖直

假设地面平坦，则 $(\boldsymbol p_i-\boldsymbol p)$ 都在水平面，可以拆：

$$\boldsymbol\tau_{\text{GRF}}=\underbrace{\sum_i(\boldsymbol p_i-\boldsymbol p)\times\boldsymbol f_i^y}_{\text{水平分量 }\boldsymbol\tau^{xz}}+\underbrace{\sum_i(\boldsymbol p_i-\boldsymbol p)\times\boldsymbol f_i^{xz}}_{\text{竖直分量 }\boldsymbol\tau^y}$$

### 1.3 ZMP 的形式定义

寻找 $\boldsymbol p$ 使得**水平分量** $\boldsymbol\tau^{xz}_{\text{GRF}}=\boldsymbol 0$：

$$\sum_i(\boldsymbol p_i-\boldsymbol p)\times\boldsymbol f_i^y=\sum_i\boldsymbol p_i\times\boldsymbol f_i^y-\boldsymbol p\times\!\!\sum_i\boldsymbol f_i^y=\boldsymbol 0$$

$$\boxed{\boldsymbol p_{\text{ZMP}}=\frac{\sum_i\boldsymbol p_i\,f_i^y}{\sum_i f_i^y}}$$

> [!note] 几何含义
> $\boldsymbol p_{\text{ZMP}}$ 就是**法向力的加权中心 = Center of Pressure**。在平地静止接触场景下，**ZMP ≡ CoP**。

### 1.4 ZMP 何时存在 / 何时脚翻转

ZMP 公式来自"CoP"的几何定义，但它必须**落在脚底接触区域内**才是合理 CoP——因为法向力只能从真实接触面发出。

> [!warning] 脚翻转判据
> 设角色摆位姿要求满足"脚不动"，写出静力 / 力矩平衡（$\boldsymbol f_{\text{ankle}}$ 是脚踝接受小腿传来的内力 / 力矩）：
> $$\boldsymbol f_{\text{ankle}}+\boldsymbol f_{\text{GRF}}+m\boldsymbol g=\boldsymbol 0$$
> $$(\boldsymbol u-\boldsymbol o)\!\times\!\boldsymbol f_{\text{ankle}}+(\boldsymbol p-\boldsymbol o)\!\times\!\boldsymbol f_{\text{GRF}}+(\boldsymbol x-\boldsymbol o)\!\times\! m\boldsymbol g+\boldsymbol\tau_{\text{ankle}}=\boldsymbol 0$$
> 取水平分量解出 $\boldsymbol p$。两种情况：
> - $\boldsymbol p\in\text{Support Polygon}$ → ZMP 真的存在，脚保持平贴地。这是**动态平衡**的指标。
> - $\boldsymbol p\notin\text{Support Polygon}$ → 物理上不可能有 CoP 在那里 → 真实 CoP $\boldsymbol p'\ne\boldsymbol p$ → $\boldsymbol\tau_{\text{GRF}}^{xz}\ne\boldsymbol 0$ → **脚开始翻转**（绕脚边滚动），不再"贴地"。

### 1.5 ZMP 与 CoM 的关系：单点近似

把整个角色简化成一个**集中在 CoM 的质点**（先忽略机身角动量）。
- 总外力：$\boldsymbol f_{\text{GRF}}-m\boldsymbol g$（向上 GRF + 向下重力）。
- 由 Newton：$m\ddot{\boldsymbol c}=\boldsymbol f_{\text{GRF}}-m\boldsymbol g$。
- 对 ZMP 求力矩 (单点模型) 自动为 0 → ZMP 落在 CoM 加速度向量与地面的交点。

这种简化让我们可以仅用 CoM 的运动方程直接讨论"今天脚下该在哪里"。

## 2. 线性倒立摆模型 LIPM

### 2.1 倒立摆 (IPM)

绕一个支点 $\boldsymbol p$、长度 $l$、质量 $m$ 全集中在顶端的杆，仅受重力：
$$\ddot\theta=\frac{g}{l}\sin\theta$$
$\theta=0$（垂直向上）是**不稳定**平衡点：微小扰动指数发散。

> [!example] 倒立摆 on a cart
> 把支点装在可平移的小车上 → 经典控制基准。前后移车产生水平惯性反力 = 把杆"拉回"垂直位置。SLIP（spring-loaded inverted pendulum）则在腿里加弹簧建模跑步。

### 2.2 LIPM 的简化假设

约束 CoM **运动在固定高度** $z_c$ 的水平面内（"不上下浮动"）。考察支点 ZMP 在 $\boldsymbol p=(p,0)$、CoM 在 $\boldsymbol x=(x,z_c)$，重力 $g$。

杆受力 $f$（GRF 沿杆方向）。水平 / 竖直方程：
$$m\ddot x=f\sin\theta,\qquad f\cos\theta=mg$$
其中 $\tan\theta=(x-p)/z_c$。消 $f$：
$$\boxed{\ddot x_{\text{com}}=\frac{g}{z_c}\,(x_{\text{com}}-p_{\text{zmp}})}$$

这是 LIPM 的核心方程——线性、二阶、横向独立。每个水平轴一条。

### 2.3 轨道能量 (Orbital Energy)

当 $p_{\text{zmp}}=0$（支点固定原点）：
$$\ddot x=\frac{g}{z_c}\,x$$
能量：
$$E=\tfrac12\dot x^2-\tfrac{g}{2z_c}x^2$$
（$E$ 是守恒量；注意第二项**负号**——这是"虚势能"，因为是不稳定平衡。）

> [!note] 用能量判断步骤
> 走一步前后能量改变 $\Delta E$ 取决于换支撑脚的时机：
> $$E_1=\tfrac12 v_f^2-\tfrac{g}{2z_c}x_f^2$$
> $$E_2=\tfrac12 v_f^2-\tfrac{g}{2z_c}(x_f-s)^2$$
> 其中 $s$ 是迈步距离。**$E_2<E_1$ ⟺ 减速；$E_2>E_1$ ⟺ 加速**。
> - **早换脚 (small $x_f$)** → 走得慢。
> - **晚换脚 (大 $x_f$)** → 走得快。

走路的"自然控制旋钮" = 步长 / 步频。这种用支撑切换控制能量的视角叫 **"Passive Dynamic Walking"**（McGeer 1990）：放在斜坡上的纯被动机械人也能稳定走下来。

### 2.4 用 IPM 做步态规划 (Coros et al. 2010)

> [!example] Generalized Biped Walking Control 流程
> 1. 把角色的 CoM + 站立脚抽象成 IPM。
> 2. 解析 / 数值预测：要让下一步落地后 CoM 静止在新支点上方，下一脚该放在哪？
> 3. 根据脚的目标位置生成摆动腿轨迹（spline / 简单 sine）。
> 4. IK 求出对应的关节目标角 $\bar q(t)$。
> 5. 关节 PD 跟踪，加上 Lec 09 的 Jacobian Transpose 维持上半身姿态。

这个 pipeline 是 2010 年代物理动画 "controllable walker" 的事实标准。

## 3. ZMP-Based Walking Pattern Generation（Cart-Table 模型）

### 3.1 反问题

IPM 给的是 CoM → ZMP 的正映射（步态规划侧）。如果需求是：

> **给定期望 ZMP 轨迹（脚步规划好了），求 CoM 轨迹**。

这是工业人形机器人（ASIMO 等）做行走规划的标准设置——脚先排好，再算腰部如何动。

### 3.2 Cart-Table 模型

把 LIPM 翻过来：一个无质量"桌面"立在 ZMP 之上，桌面上有一辆小车 (mass $m$)。小车 $\ddot x$ 决定桌子翻不翻：
$$p_{\text{zmp}}=x-\frac{z_c}{g}\,\ddot x$$

(这正是 LIPM 方程 $\ddot x=\tfrac{g}{z_c}(x-p)$ 解出 $p$ 的形式。)

> [!note] 物理直觉
> 桌面只要保持不翻，**净水平力矩对 ZMP 必须为零**——这恰好把"脚不翻转"的约束完全卡死。

### 3.3 离散化与三对角系统

时间离散 $x_i=x(i\Delta t)$，用二阶中心差分：
$$\ddot x_i\approx\frac{x_{i-1}-2x_i+x_{i+1}}{\Delta t^2}$$

代入：
$$p_i=x_i-\frac{z_c}{g}\cdot\frac{x_{i-1}-2x_i+x_{i+1}}{\Delta t^2}=a_i x_{i-1}+b_i x_i+c_i x_{i+1}$$

$$a_i=-\frac{z_c}{g\Delta t^2},\quad b_i=\frac{2z_c}{g\Delta t^2}+1,\quad c_i=-\frac{z_c}{g\Delta t^2}$$

> [!example] 三对角线性方程组
> 给定 $\{p_1,\dots,p_{N-1}\}$（期望 ZMP 序列），未知 $\{x_0,\dots,x_N\}$：
> $$\begin{bmatrix}p_1\\ p_2\\ \vdots\\ p_{N-1}\end{bmatrix}=\begin{bmatrix}a_1 & b_1 & c_1\\ & a_2 & b_2 & c_2\\ & & \ddots & \ddots & \ddots\\ & & & a_{N-1} & b_{N-1} & c_{N-1}\end{bmatrix}\!\!\begin{bmatrix}x_0\\ x_1\\ \vdots\\ x_N\end{bmatrix}$$
>
> $O(N)$ 时间用 Thomas 算法解。每个水平轴独立求解。

### 3.4 Preview Control (Kajita 2003)

Cart-Table 离散方程的线性 + 因果性意味着可以做 **LQR 风格的滚动时域控制 (MPC)**：在每一帧，"预览"未来 $T_\text{preview}\sim 1$ s 的 ZMP 序列，求最优 $\ddot x$。

> [!note] Why preview？
> 因为 LIPM 是**不稳定**系统（$\ddot x$ 与 $x$ 同号），单纯反馈无法稳定。Preview 把"未来要去的 ZMP"作为 feedforward 输入，本质和飞行器 / 自行车 controller 用 lookahead 一样。
>
> 这就是 **ASIMO**、HRP-2、Atlas 等工业人形机器人步态规划的核心算法。

### 3.5 SLIP 与更复杂的简化模型

> [!example] Spring-Loaded Inverted Pendulum (SLIP)
> 腿上加一根弹簧 → 能描述跑步、跳跃中的能量回弹。
> Mordatch et al. 2010 *"Robust Physics-Based Locomotion Using Low-Dimensional Planning"* 用 SLIP 在地形中规划，再用 ID 把简化轨迹转回 full-body 力矩。

## 4. SIMBICON：4 状态 FSM 走路控制

> [!note] SIMBICON = SIMple BIped LOCOMOTION CONtrol
> Yin et al. 2007，SIGGRAPH。在 PD + FSM 框架上加一个简单 linear feedback，就能让物理仿真的双足角色稳定行走，并对外力扰动有较好鲁棒性。是基于物理的角色动画领域的 milestone。

### 4.1 Step 1：周期 base motion（FSM）

定义 4 个状态：

| 状态 | 角色姿态 | 时长 | 切换条件 |
|------|----------|------|---------|
| 0 | 左脚抬起摆动 | 0.3 s | 时间到 |
| 1 | 左脚触地 | — | foot strike |
| 2 | 右脚抬起摆动 | 0.3 s | 时间到 |
| 3 | 右脚触地 | — | foot strike |

每个状态指定一组关节目标角 $\bar q$ → 关节 PD 跟踪 → 自然产生迈步循环。

### 4.2 Step 2：World-frame 控制躯干与摆动腿

> [!warning] 单纯关节 PD 不够
> 用关节相对父 link 的角度做 PD → 躯干会跟随支撑腿一起前倾。要让躯干**在世界系下保持直立**，必须用 "world-frame angle" 而非 "joint angle"。

设 stance hip 关节 A、躯干、swing hip 关节 B：
- 用 PD 控制躯干在 world 系下的角度 → 得到 $\boldsymbol\tau_{\text{torso}}$。
- 用 PD 控制 swing hip 在 world 系下角度 → 得到 $\boldsymbol\tau_B$。
- **stance hip 的力矩由牛顿第三定律决定**：
$$\boxed{\boldsymbol\tau_A=-\boldsymbol\tau_{\text{torso}}-\boldsymbol\tau_B}$$

为什么是这个？stance leg 已经把脚撑在地上不能动，所以躯干 / swing leg 朝想要的方向旋转 → 它们的反力矩必须由 stance hip 经地面承担。

### 4.3 Step 3：CoM Feedback（关键创新）

把当前 swing hip 的目标角度调整为：
$$\bar\theta_d=\bar\theta_{d0}+c_d\,d+c_v\,v$$

其中：
- $d=$ CoM 相对 stance foot 的水平位移（前后偏离）
- $v=$ CoM 在 stance frame 下的水平速度
- $c_d,c_v>0$ 是反馈增益

> [!example] 直觉
> - $d>0$（CoM 偏前）→ $\bar\theta_d$ 加大 → swing 腿跨更远，**前迈一大步**接住前倾的躯干。
> - $v$ 大 → 同理，要迈得更远才能"接住"。
> - $d<0$（CoM 偏后）→ swing 腿后缩 → 重心被往前拉。
>
> 这就是 Lec 09 末尾说的 **stepping strategy** 的具体实现，本质上是用脚的位置改变下一步的支撑多边形。

### 4.4 SIMBICON 的工程优势

> [!note] 三层之和能跑
> $$\text{FSM (base motion)}\ +\ \text{world-frame torso/swing}\ +\ \text{linear COM feedback}$$
> 就足以让仿真角色稳定走、跑、扭头、躲球。
>
> 这是物理动画里**第一次**在通用 simulator (ODE) 上用极简控制律实现 robust locomotion。后续 PFNN、DeepMimic 等"学习派"的 baseline 全是 SIMBICON 类的扩展。

### 4.5 SIMBICON 的局限

- 只对**周期步态**好用——突发动作（跳跃、踉跄、特技）需要更复杂的 FSM 或学习方法。
- $c_d,c_v$ 仍要手调。
- 推广到不同身形 / 不同步态需要重做 FSM。

这些局限正是 Lec 06 学习派方法（PFNN / DeepMimic / AMP / ControlVAE）要解决的问题——把"控制律的设计"转化为"用数据学回归"。

## 6. 三种简化模型对比

| 模型 | 假设 | 用途 | 给出 | 代价 |
|------|------|------|------|------|
| **倒立摆 IPM** | 单点质量 + 杆 | 直觉 / 步长规划 | $\ddot\theta=g/l\sin\theta$ | 不能控 |
| **LIPM** | CoM 固定高度 | 步态规划、能量分析 | $\ddot x=g/z(x-p)$（线性） | $z$ 固定 |
| **Cart-Table** | LIPM 反向 | ZMP→CoM 三对角解 | $p=x-z/g\,\ddot x$ | 一维线性 |
| **SLIP** | 弹簧腿 | 跑步 / 跳跃 | 非线性 | 需数值积分 |
| **完整角色** | 多刚体 NE | 仿真 / 学习 | $M\dot v+C=f$ | 高维 |

每一阶模型抹掉细节换简洁，把"全身控制"压缩为低维 trajectory 规划。

## 7. 走路控制律的层级

```
                ┌──────────────────────────┐
HIGH-LEVEL      │ Footstep planning (LIPM, MPC) │
                │ → desired ZMP / CoM trajectory │
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
MID-LEVEL       │ Trajectory tracking      │
                │ - IK to get joint targets │
                │ - Stepping strategy       │
                │ - SIMBICON FSM           │
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
LOW-LEVEL       │ Joint torque (Lec 09)    │
                │ - PD / Stable PD          │
                │ - Jacobian Transpose      │
                │ - Inverse Dynamics        │
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
PHYSICS         │ Simulator (Lec 08)       │
                │ M v_dot + C = f + J^T λ   │
                └──────────────────────────┘
```

## 8. 与 Lec 06 学习派的衔接

> [!note] 经典 vs. 学习
> | 阶段 | 经典 (Lec 10) | 学习 (Lec 06) |
> |------|--------------|---------------|
> | Footstep planning | LIPM / Cart-Table / MPC | RNN / Transformer / VAE |
> | Trajectory | 手编 FSM / mocap | mocap → RL reward |
> | Joint torque | PD + ID | PD with NN-predicted $\bar q$ |
> | 反馈鲁棒性 | linear feedback gain | learned policy |
>
> 学习派**复用**经典派的所有底层（PD、Stable PD、Jacobian Transpose）——区别只是把高层"FSM + linear feedback"替换为神经网络策略 $\pi_\theta(\boldsymbol s)$，用 PPO / SAC 训练。
>
> DeepMimic (Peng et al. 2018) 的 reward 即包含**模仿 mocap**（pose / vel / end-effector / CoM 四项）+ task reward；动作空间正是关节 PD 的目标角 $\bar q$。AMP (Peng et al. 2021) 把"模仿"换成 GAN-style 鉴别器。

## 9. 工程要点速记

> [!tip] 实战经验
> - **ZMP 的横向 vs. 纵向**：两个水平轴的 LIPM **解耦**，可独立规划侧向摆动（用于跨步过程中身体晃动）和前进。
> - **ZMP 安全余量**：实际控制器目标 ZMP 不在 polygon 边缘 → 留 1–2 cm 余量，否则离散误差 + 摩擦不足直接翻脚。
> - **Cart-Table 边界条件**：起点 / 终点 $x_0,x_N$ 必须给死，否则三对角系统欠定。常令角色起步前在原地振荡几个周期"预热"。
> - **SIMBICON 调参顺序**：先把 base motion 时长（0.3 s）调出"看起来像走"；再调 stance hip $k_p$ 让躯干立直；最后扫 $c_d,c_v$ 让"被推一下能站住"。$c_d\sim 0.5$，$c_v\sim 0.2$ 为人形 50 kg 经验值。
> - **摩擦不足时**：LIPM 假设地面提供任意水平力 → 真实地面 $\mu\approx 0.5\sim 1$ 限制了 $\ddot x$。规划时要加摩擦锥约束。
> - **从仿真到真机 (sim-to-real)**：ZMP / SIMBICON 方法**直接可移植**——它们本来就来自机器人圈；但 RL 训练的 policy 需要 domain randomization + residual force 关闭。

## 记号速查

| 符号 | 含义 |
|------|------|
| $\boldsymbol c,\dot{\boldsymbol c},\ddot{\boldsymbol c}$ | CoM 位置 / 速度 / 加速度 |
| $\boldsymbol p_{\text{ZMP}}$ | Zero-Moment Point |
| $\boldsymbol p_{\text{CoP}}$ | Center of Pressure（平地等价于 ZMP） |
| $\boldsymbol f_{\text{GRF}}$ | 地面反作用力 |
| $\boldsymbol\tau_{\text{GRF}}^{xz},\tau_{\text{GRF}}^y$ | GRF 力矩水平 / 竖直分量 |
| $\boldsymbol f_i^y,\boldsymbol f_i^{xz}$ | 第 $i$ 个接触点法向 / 摩擦分量 |
| Support Polygon | 接触点凸包 |
| $z_c$ | LIPM 中 CoM 固定高度 |
| $E$ | 轨道能量 $\tfrac12\dot x^2-\tfrac{g}{2z_c}x^2$ |
| $s$ | 步长（迈步距离） |
| $a_i,b_i,c_i$ | Cart-Table 三对角元 |
| $\Delta t$ | Cart-Table 离散步长 |
| FSM | Finite State Machine |
| $d,v$ | SIMBICON 中 CoM 相对 stance foot 的水平位移与速度 |
| $c_d,c_v$ | SIMBICON 反馈增益 |
| $\boldsymbol\tau_A,\boldsymbol\tau_B,\boldsymbol\tau_{\text{torso}}$ | stance hip / swing hip / 躯干力矩 |

## 10. 关键文献

> [!example] 经典论文
> - **Vukobratović & Borovac (1972)** —— ZMP 概念提出。
> - **Kajita et al. (2001)** —— LIPM 命名与论证。
> - **Kajita et al. (2003)** —— ZMP preview control + Cart-Table。
> - **McGeer (1990)** —— Passive Dynamic Walking。
> - **Yin et al. (2007)** —— SIMBICON。
> - **Coros et al. (2010)** —— Generalized Biped Walking Control (IPM-based)。
> - **Mordatch et al. (2010)** —— Low-dim planning with SLIP。
> - **Macchietto et al. (2009)** —— Momentum Control for Balance（Lec 09 末尾）。
> - **Peng et al. (2018)** —— DeepMimic（衔接 Lec 06）。
> - **Peng et al. (2021)** —— AMP（衔接 Lec 06）。

> [!tip] 期中复习要点
> 1. **静态 vs. 动态平衡**的几何刻画 (CoM, support polygon, single/double stance)。
> 2. **ZMP 的定义与判据**：能推出 $\boldsymbol p_{\text{ZMP}}=\sum p_i f_i^y/\sum f_i^y$；能用"$\boldsymbol p$ 是否在 polygon 内"判断脚是否翻转。
> 3. **LIPM 推导**：从 $\ddot\theta=g/l\sin\theta$ 加"固定高度"假设到 $\ddot x=g/z(x-p)$，能从能量公式 $E$ 看出 early / late switch 对应加 / 减速。
> 4. **Cart-Table**：三对角系统的形式 + Thomas $O(N)$ 求解 + preview control 的必要性（LIPM 不稳定）。
> 5. **SIMBICON 三步骤**：FSM、world-frame torque、linear COM feedback；能解释 stance hip 力矩为何由牛顿第三定律决定。
> 6. **走路控制层级**：footstep planning → trajectory → joint torque → simulator；理解每层的边界。
> 7. **经典 vs. 学习**：DeepMimic / AMP 在哪些层"替换"了哪些经典模块，哪些层是共享的。
