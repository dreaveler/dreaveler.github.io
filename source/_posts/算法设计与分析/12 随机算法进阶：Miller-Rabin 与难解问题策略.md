---
title: 12 随机算法进阶：Miller-Rabin 与难解问题策略
date: "2026-06-08"
number: 12
categories:
  - 课程笔记
  - 算法设计与分析
tags:
  - 算法设计与分析
permalink: /notes/算法设计与分析/12 随机算法进阶：Miller-Rabin 与难解问题策略/
banner_img: /images/banners/gallery/nasa-004-pia20064.jpg
category_bar: true
math: true
---

# 随机算法进阶：Miller-Rabin 与难解问题策略

> [!tip] 学习指南
> 本讲核心：**用随机性回答一个 NP 中尚不知是否在 P 的判定问题——素数判定**。沿用 Lec 18 的"投硬币换正确性概率"范式，构造期望 $O(\log^4 n)$ 的 **Miller–Rabin 素数测试**；之后**把 Lec 18 + Lec 19 见过的所有随机算法整理到 ZPP / RP / coRP / BPP 四类复杂度类**；最后揭开**第 12 章「处理难解问题的策略」**的序幕——当一个问题既不能精确多项式解、近似又不够时，还能用「**限制输入** / **固定参数** / **改进指数算法** / **启发式** / **平均情形** / **统计物理**」等手段降低实际难度。
> 前置知识：
> 1. **初等数论**——同余 $a\equiv b\pmod n$、欧拉/费马小定理、最大公约数与素数；本讲第一次用到时**原地补充**精确陈述与最短证明。
> 2. **位运算与二进制表示**——为分析 `ExpMod` 的位复杂度做准备。
> 3. **概率论基础**——期望、独立、条件概率、重复独立实验失败率压缩公式 $(1-p)^k$；与 Lec 18 §1 完全相同，本讲在 §1 中再做一次精炼复习以保 self-contained。
> 4. **P / NP / NPC 概念**——第 12 章策略全部围绕"NP-难"展开，假定读者已对 Lec 13–15 有最基本印象；§5 会原地复述 P / NP 的定义。
> 5. 与 Lec 18 的关系：Lec 18 给"随机化"打下两类范式（Las Vegas / Monte Carlo）和 Boost 技巧；Lec 19 把这一武器用在**真正前沿的判定问题**（素数检验），并把整堂"随机算法"模块**收口到复杂度类**。
>
> 重点掌握：
> - (i) `ExpMod` 为何是 $O(\log^3 n)$（按位乘统计）；
> - (ii) 费马小定理为什么**只是必要、非充分**条件，以及 Carmichael 数为何让 `Ptest2` 失效；
> - (iii) Theorem 2「素模下 $x^2\equiv 1$ 仅有平凡根 $\pm 1$」与"**非平凡平方根存在 $\Rightarrow$ 合数**"判别法；
> - (iv) `findq-m` + `test` 两个子过程的伪码与 $O(\log^3 n)$ 单测试位复杂度；
> - (v) 单次出错概率 $\le 1/2$、重复 $k=\log n$ 次得到错误率 $\le 1/n$ 的总算法 `PremalityTest`；
> - (vi) **ZPP / RP / coRP / BPP** 的精确定义以及对应到本课所有随机算法的归类表；
> - (vii) 单侧错误两种形态（弃真型 = false negative dominant，取伪型 = false positive dominant）的判别与意义；
> - (viii) 第 12 章六大策略的目录视图，重点 **2SAT/HornSAT 限制属于 P** 与 **VC 的固定参数算法 $O(2^k kn)$**。

---

## 0. 全景鸟瞰

本讲可以按三层结构阅读：

1. 先补齐 Miller-Rabin 所需的概率论、同余和快速模幂工具。
2. 再从费马小定理的随机测试失败讲起，说明 Carmichael 数为什么迫使我们引入“非平凡平方根”判别。
3. 最后把本课出现过的随机算法放进 `ZPP / RP / coRP / BPP`，并把视角从“随机化”扩展到处理 NP 难问题的六类策略。

> [!note] 一句话区分两套结构
> **素数检验**是把 Lec 18 的「Boost + Monte Carlo」直接套用到一个**有重大实际价值**（密码学）的判定问题；**复杂度分类**是把已学随机算法**收编**进可比较的形式语言；**难解问题策略**是给未来面对 NP-难时的**工具箱总目录**。三者层层抬升：从算法 → 分类 → 策略。

---

## 1. 概率论 / 数论速通（原地补充，保证零前置）

为零前置可读，列出本讲全部要用的概率与数论工具的精确定义。后文用到时直接引用编号。

### 1.1 概率工具（精简自 Lec 18 §1）

- **事件与概率**：在样本空间 $\Omega$ 上，事件 $A$ 出现的概率记 $\Pr[A]\in[0,1]$。
- **随机变量与期望**：$X:\Omega\to\mathbb R$；若 $X$ 取至多可数值，$\mathbb E[X]=\sum_x x\Pr[X=x]$。
- **线性期望**：$\mathbb E[\sum_i a_i X_i]=\sum_i a_i\mathbb E[X_i]$，**不要求** $X_i$ 独立。
- **独立**：事件 $A,B$ 独立 $\iff \Pr[A\cap B]=\Pr[A]\Pr[B]$。

> **引理 1.1**（Boost：重复独立实验压低失败率）
> 设算法单次失败概率 $\le q\in[0,1)$，独立重复 $k$ 次，则
> $$\Pr[\text{$k$ 次全失败}]\le q^k. \tag{1.1}$$
> 特别地，要把失败率压到 $\le \varepsilon$，取 $k\ge \dfrac{\ln(1/\varepsilon)}{\ln(1/q)}$ 即可。

> [!example] Boost 在素数测试中的样子
> 后文 Miller–Rabin 单次失败率 $\le 1/2$。取 $k=\log_2 n$，总失败率 $\le 2^{-\log_2 n}=1/n$。

### 1.2 数论工具

> **定义 1.2**（同余）
> 整数 $a,b,n$，$n>0$。称 $a\equiv b\pmod n$ 当且仅当 $n\mid(a-b)$。同余关系是 $\mathbb Z$ 上的等价关系，且加、减、乘均与同余兼容。

> **定理 1.3**（费马小定理，Fermat's Little Theorem）
> 若 $p$ 为素数，$a$ 为正整数且 $a\not\equiv 0\pmod p$（等价 $\gcd(a,p)=1$），则
> $$a^{p-1}\equiv 1\pmod p. \tag{1.2}$$

**证明（一行式直觉版）**：考察集合 $\{1,2,\dots,p-1\}$ 在乘以 $a$（模 $p$）下的像。由 $\gcd(a,p)=1$，乘法是双射；故两侧元素之积相等：
$$
(p-1)!\equiv a\cdot 2a\cdots (p-1)a=a^{p-1}\cdot (p-1)!\pmod p.
$$
$(p-1)!$ 与 $p$ 互素可消去，得 $a^{p-1}\equiv 1\pmod p$。$\blacksquare$

> **定理 1.4**（素模下 $x^2\equiv 1$ 仅有平凡根 $\pm 1$）
> 若 $n=p$ 为奇素数，则方程 $x^2\equiv 1\pmod p$ 在 $\{0,1,\dots,p-1\}$ 内**只有两个解** $x=1$ 与 $x=p-1$（即 $-1$）。

**证明**：
$$
x^2\equiv 1\pmod p \iff (x-1)(x+1)\equiv 0\pmod p.
$$
$\mathbb Z/p\mathbb Z$ 是域，**没有零因子**，故 $(x-1)\equiv 0$ 或 $(x+1)\equiv 0$，即 $x\equiv\pm 1\pmod p$。$\blacksquare$

> [!warning] 关键反向使用
> **逆否**：若发现 $x\in\{0,\dots,n-1\}$ 满足 $x^2\equiv 1\pmod n$ 且 $x\ne\pm 1$（称 **非平凡平方根**），**则 $n$ 必为合数**。这就是 Miller–Rabin 判合数的依据。

> **定义 1.5**（Carmichael 数）
> 合数 $n$ 称为 Carmichael 数当且仅当**对所有**与 $n$ 互素的 $a$ 都成立 $a^{n-1}\equiv 1\pmod n$。
>
> 例：561, 1105, 1729, 2465。$\le 10^8$ 内共 255 个，分布极稀。

> [!warning] 单凭费马小定理为何不够？
> 若 $n$ 是 Carmichael 数，则**任意** $a$ 都让 `Ptest2` 输出"素数"，**单侧错误率不再受任何控制**——失败率不是 $\le 1/2$，而是几乎 1。这是为什么必须引入"非平凡平方根判别"（Theorem 1.4），即 Miller–Rabin。

---

## 2. 模幂运算：算法基石

素数测试要反复算 $a^{n-1}\bmod n$。当 $n\sim 2^{1024}$（RSA 实际尺度）时，朴素逐项相乘要 $n$ 次乘法、绝不可行。本节给出 $O(\log m)$ 次乘法的**反复平方**法，并以**按位乘**为基本运算统计位复杂度。

### 2.1 算法：求实数 $x^m$

> **算法 `Exp(x, m)`**
> **输入**：实数 $x$；非负整数 $m$，二进制 $m=d_k d_{k-1}\cdots d_1 d_0$。
> **输出**：$x^m$。
> ```text
> 1  y ← 1
> 2  for j ← k downto 0 do
> 3      y ← y · y                   # 平方
> 4      if d_j = 1 then y ← x · y   # 看二进制位
> 5  return y
> ```

**正确性**（循环不变量）：进入第 $j$ 轮前 $y=x^{(d_k\cdots d_{j+1})_2}$。出口 $j=-1$ 时 $y=x^{(d_k\cdots d_0)_2}=x^m$。

**实例 $x^5$（$m=101_2$，$k=2$）**：

| 阶段 | $j$ | $d_j$ | 平方后 $y$ | 乘 $x$ 后 $y$ |
|----|----|----|------|------|
| 初始 | — | — | $1$ | — |
| 第 1 轮 | 2 | 1 | $1$ | $x$ |
| 第 2 轮 | 1 | 0 | $x^2$ | $x^2$ |
| 第 3 轮 | 0 | 1 | $x^4$ | $x^5$ |

> [!note] 复杂度（实数计算）
> 主循环 $k+1=\lfloor\log_2 m\rfloor+1=O(\log m)$ 次乘法。**乘法**这里按"一次基本运算"计。位复杂度需要进一步算。

### 2.2 算法：模幂 $a^m\bmod n$

> **算法 `ExpMod(a, m, n)`**
> **输入**：$a, m, n\in\mathbb Z^+$，$m\le n$，$m$ 的二进制 $b_k\cdots b_0$。
> **输出**：$a^m\bmod n$。
> ```text
> 1  c ← 1
> 2  for j ← k downto 0 do
> 3      c ← c² mod n                # 平方再取模
> 4      if b_j = 1 then c ← a·c mod n
> 5  return c
> ```

**正确性**：与 `Exp` 完全同构，只是把每次乘法替换为「乘后取模」。每个中间结果恒被压在 $[0,n-1]$ 内。

> **定理 2.1**（`ExpMod` 的位复杂度）
> 按位乘作为基本运算，`ExpMod(a, m, n)` 在 $O(\log^3 n)$ 位运算内完成。

**证明**：
- 主循环 $k+1=O(\log m)=O(\log n)$ 轮（因 $m\le n$）。
- 每轮做一次平方、一次乘、各跟一次取模。
- 两个 $\le n$ 的整数相乘是 $O(\log^2 n)$ 位运算；除以 $n$ 也是 $O(\log^2 n)$。
- 累乘：$O(\log n)\cdot O(\log^2 n)=O(\log^3 n)$。$\blacksquare$

> [!example] 体感数字
> $n\sim 2^{1024}$ 时 $\log n\sim 1024$，单次 `ExpMod` 约 $10^9$ 位运算量级——现代 CPU 微秒级完成。

---

## 3. 由费马小定理出发的两轮失败尝试

### 3.1 `Ptest1`：固定 $a=2$

> **算法 `Ptest1(n)`**（$n$ 为奇整数，$n>5$）
> ```text
> 1  if ExpMod(2, n-1, n) = 1 then return "prime"
> 2  else return "composite"
> ```

**为何这样设计**：若 $n$ 是素数则费马小定理保证 $2^{n-1}\equiv 1\pmod n$，所以"composite"的判断**永不冤枉素数**；但反向不必然——$n$ 是合数时 $2^{n-1}$ 也可能恰好 $\equiv 1$。

> **定义 3.1**（基 $a$ 伪素数 / pseudoprime to base $a$）
> 合数 $n$ 满足 $a^{n-1}\equiv 1\pmod n$ 时，称 $n$ 是**基 $a$ 的伪素数**。

> [!example] 基 2 伪素数 $n=341$
> $341=11\cdot 31$，$\gcd(2,341)=1$，可验 $2^{340}\equiv 1\pmod{341}$。`Ptest1(341)` 错判为"prime"。

### 3.2 `Ptest2`：随机选 $a$

> **算法 `Ptest2(n)`**
> ```text
> 1  a ← Random(2, n-2)             # 均匀随机
> 2  if ExpMod(a, n-1, n) = 1 then return "prime"
> 3  else return "composite"
> ```

**直觉**：随机化打破了"对手知道你只看 $a=2$"的攻击。对**非 Carmichael 数**的合数 $n$，由初等数论可证至少有一半的 $a\in\{2,\dots,n-2\}$ 让 $a^{n-1}\not\equiv 1\pmod n$（"见证 $n$ 是合数"的 $a$ 至少占一半）；故单次失败率 $\le 1/2$。

> **结论 3.2**（非 Carmichael 数的随机费马测试）
> $n$ 是合数且**非 Carmichael 数** $\Rightarrow$ `Ptest2(n)` 输出 "composite" 的概率 $\ge 1/2$。

> [!warning] 致命缺陷：Carmichael 数
> 若 $n$ 是 Carmichael 数（例 $n=561$），则**所有**与 $n$ 互素的 $a$ 都满足 $a^{n-1}\equiv 1$，`Ptest2` 几乎永远输出 "prime"。Boost 也救不了——失败率不再被 $1/2$ 控制。

**实例**：$n=561=3\cdot 11\cdot 17$ 是 Carmichael 数；$a=7$ 与 $n$ 互素，$7^{560}\equiv 1\pmod{561}$，`Ptest2` 误判为 "prime"。

**症结**：费马小定理只是"素数"的**必要条件**之一；Carmichael 数证明它对合数判别**不充分**。要修复，必须加入**新的必要条件**。这正是定理 1.4 派上用场之处。

---

## 4. Miller–Rabin：把"非平凡平方根"加入检测

### 4.1 构造平方序列

> **思想**：若 $n$ 是奇素数，写 $n-1=2^q m$（$m$ 奇，$q\ge 1$）。构造序列
> $$a^m,\; a^{2m},\; a^{4m},\; \dots,\; a^{2^q m}=a^{n-1}\pmod n. \tag{4.1}$$
> 后一项是前一项的平方。**若 $n$ 为素数**，根据定理 1.4，**任何**一项等于 1 时，**前一项**只能是 $\pm 1$。
> **逆否**：若发现某 $i$ 满足 $a^{2^{i+1} m}\equiv 1\pmod n$，但 $a^{2^i m}\not\equiv 1$ 且 $\not\equiv n-1$，则**找到了非平凡平方根，$n$ 必为合数**。再叠加费马必要条件 $a^{n-1}\equiv 1$，得到两条独立的判别。

> [!example] $n=561,\ a=7$
> $n-1=560=2^4\cdot 35$，$q=4,m=35$。序列：
> | $i$ | $2^i m$ | $7^{2^i m}\bmod 561$ |
> |---|---|---|
> | 0 | 35 | 241 |
> | 1 | 70 | 298 |
> | 2 | 140 | 166 |
> | 3 | 280 | 67 |
> | 4 | 560 | 1 |
>
> 第 4 项是 1，但第 3 项 $=67\notin\{1, 560\}$ → **非平凡平方根** → $n=561$ 是**合数**。
> Carmichael 反例被攻破——这正是 Miller–Rabin 比 `Ptest2` 强的根本原因。

### 4.2 子过程 1：`findq-m`

> **算法 `findq-m(n)`** — 求 $q,m$ 使 $n-1=2^q m$（$m$ 奇）
> ```text
> 1  q ← 0
> 2  m ← n − 1
> 3  repeat
> 4      m ← m / 2
> 5      q ← q + 1
> 6  until m 是奇数
> ```
> **位复杂度**：循环至多 $\log n$ 次，每次 $O(\log n)$ 位运算除以 2 $\Rightarrow$ $O(\log^2 n)$（够用就行；总算法瓶颈在 `test`）。教材标 $O(\log n)$，按"除以 2 算 1 次基本运算"。

### 4.3 子过程 2：`test`

> **算法 `test(n, q, m)`**
> ```text
> 1  a  ← Random(2, n − 1)
> 2  x₀ ← ExpMod(a, m, n)               # O(log³ n)
> 3  for i ← 1 to q do                   # q = O(log n)
> 4      x_i ← x_{i−1}² mod n            # 一次模平方 O(log² n)
> 5      if x_i = 1 and x_{i−1} ≠ 1 and x_{i−1} ≠ n−1 then
> 6          return "composite"
> 7  if x_q ≠ 1 then return "composite"
> 8  return "prime"
> ```

**正确性细节**：
- 第 5 行检测**非平凡平方根**：上一项不在 $\{1, n-1\}$，但平方为 1 → 由 Theorem 1.4 立刻断言合数。
- 第 7 行检测**费马必要条件**：$x_q=a^{n-1}\bmod n$ 必须 $=1$ 才能宣告"prime"。
- 通过第 5、7 行**两道关卡**才返回 "prime"，绕过了 Carmichael 漏洞。

> **定理 4.1**（`test` 的单次性能）
> 单次 `test(n,q,m)` 位运算量为 $O(\log^3 n)$；**单次出错（合数被误判为 "prime"）概率 $\le 1/2$**。

证明：
- 时间：第 2 行 `ExpMod` 占 $O(\log^3 n)$；第 3–6 行循环 $q=O(\log n)$ 次，每次 $O(\log^2 n)$，合计 $O(\log^3 n)$。
- 正确性：详细证明出错率 $\le 1/2$ 涉及群论（$a\in(\mathbb Z/n\mathbb Z)^*$ 中"作证人"的 $a$ 至少占一半，即 Rabin 1980 定理）。**结论**：合数 $n$ 在 $\{2,\dots,n-1\}$ 中**至少有 $\tfrac{3}{4}(n-1)$**（甚至更紧 $\tfrac{n-1}{2}$）个 "witness"。本课只用最保守的 1/2 上界。$\blacksquare$

### 4.4 总算法 Miller–Rabin

> **算法 `PremalityTest(n)`** — $n\ge 5$，奇整数
> ```text
> 1  findq-m(n)                         # 得 q, m
> 2  k ← log n                          # 注：log 默认以 2 为底
> 3  for i ← 1 to k do
> 4      if test(n, q, m) = "composite" then return "composite"
> 5  return "prime"
> ```

> **定理 4.2**（总性能）
> $T(n) = O(\log^4 n)$（按位乘统计）；**出错概率 $\le 2^{-k} = 1/n$**。

**说明**：
- 时间：$k=O(\log n)$ 次 `test`，每次 $O(\log^3 n)$，合计 $O(\log^4 n)$。
- 出错率：单次 $\le 1/2$，独立重复 $k=\log n$ 次（由引理 1.1）→ 失败率 $\le (1/2)^{\log n}=1/n$。
- **若 $n$ 为素数**：每次 `test` 都不会发现非平凡平方根、也满足费马条件 → 总算法**永远输出 "prime"**（零错误）。
- **若 $n$ 为合数**：以至少 $1-1/n$ 概率输出 "composite"。

> [!note] 错误的类型：取伪型单侧
> Miller–Rabin 输出 "composite" 时**绝对正确**（一定找到了合数的证据）；输出 "prime" 时**可能错**（错误率 $\le 1/n$）。即"宣称接受时可能出错"——**取伪型单侧错误**（见 §5）。

> [!example] 对照表：三代素数测试演化
> | 算法 | 形式 | 致命弱点 | 解决了什么 |
> |---|---|---|---|
> | `Ptest1` | 固定 $a=2$ | 任何基 2 伪素数（341）失败 | — |
> | `Ptest2` | 随机 $a$ | Carmichael 数（561）失败 | 打破对手固定 $a$ 的对抗 |
> | Miller–Rabin | 随机 $a$ + 平方根检验 | 实际无；理论失败率 $\le 1/n$ | 修补费马小定理对 Carmichael 失效的漏洞 |

### 4.5 历史与现实

- Miller–Rabin 是 RSA 公钥密码的基础——生成 1024 / 2048 / 4096 位素数都用它。
- 失败率 $1/n$ 在 $n\sim 2^{1024}$ 时 $\le 2^{-1024}$，比"宇宙原子数倒数"还小数百个数量级。
- 2002 年 Agrawal–Kayal–Saxena 证明**素数检验在 P**（AKS 算法，$\tilde O(\log^{6} n)$ 确定性），但常数大、实践仍用 Miller–Rabin。

---

## 5. 随机算法的复杂度分类

把 Lec 18 + Lec 19 见过的所有随机算法**收编**到统一形式语言。本节是必背概念，**复习提纲就靠这张表**。

### 5.1 Las Vegas vs Monte Carlo（精确陈述）

> **定义 5.1**（Las Vegas 随机算法）
> 总是给出**正确**结果；**运行时间是随机变量**。**期望运行时间为输入规模的多项式**的 Las Vegas 算法称为**有效的**。

> **定义 5.2**（Monte Carlo 随机算法）
> **可能给出错误答案**；运行时间与出错率都是随机变量，重点分析**出错概率**。**多项式时间内运行且出错率 $\le 1/3$** 的 Monte Carlo 算法称为**有效的**。

> [!warning] 1/3 不是物理常数
> 1/3 是约定的"分界线"——可以替换成任何 $< 1/2$ 的常数（用 Lec 18 的 Boost 即可在不损害多项式时间的前提下把它压到任意小）。教材取 1/3 是历史习惯。

### 5.2 单侧错误的两种形态

> **定义 5.3**（弃真型单侧错误 / one-sided rejecting）
> - 算法宣布**接受**时：结果**一定对**。
> - 算法宣布**拒绝**时：结果**可能错**（"弃真"——把真的当假的扔了）。
>
> **典型例**：Lec 18 主元素测试。"找到主元素并宣称存在"必然对（构造性证据），但"宣称没有主元素"可能错。

> **定义 5.4**（取伪型单侧错误 / one-sided accepting）
> - 算法宣布**拒绝**时：结果**一定对**。
> - 算法宣布**接受**时：结果**可能错**（"取伪"——把假的当真的接收）。
>
> **典型例**：Miller–Rabin。"宣称 composite"必然对（找到了证据：要么费马不成立，要么非平凡平方根存在）；"宣称 prime" 可能错。

> **定义 5.5**（双侧错误 / two-sided）
> 既会"取伪"又会"弃真"。

### 5.3 复杂度类（必背）

> **定义 5.6**（四大随机复杂度类）
> 设语言 $L\subseteq\Sigma^*$。
>
> - **$\mathsf{ZPP}$**（Zero-error Probabilistic Polynomial）：存在期望多项式时间 **Las Vegas** 算法判定 $L$ 且**永不出错**。
> - **$\mathsf{RP}$**（Randomized Polynomial）：存在多项式时间随机算法，
>   - $x\in L$ ⇒ $\Pr[\text{接受}]\ge 1/2$；
>   - $x\notin L$ ⇒ $\Pr[\text{接受}]=0$。
>   （**弃真型单侧错误**：宣称接受时绝对对。）
> - **$\mathsf{coRP}$**：与 $\mathsf{RP}$ 对偶。$x\in L$ ⇒ $\Pr[\text{接受}]=1$；$x\notin L$ ⇒ $\Pr[\text{接受}]\le 1/2$。（**取伪型单侧错误**）
> - **$\mathsf{BPP}$**（Bounded-error Probabilistic Polynomial）：存在多项式时间随机算法使
>   $\Pr[\text{算法回答 } \mathbf 1\{x\in L\}]\ge 2/3$（双侧错误，$\le 1/3$）。

> **定理 5.7**（包含关系）
> $\mathsf{ZPP}=\mathsf{RP}\cap\mathsf{coRP}\subseteq\mathsf{RP}\cup\mathsf{coRP}\subseteq\mathsf{BPP}$；$\mathsf{P}\subseteq\mathsf{ZPP}$。

> [!example] 课内算法归类（必背表）
> | 算法 | 类型 | 复杂度类 |
> |---|---|---|
> | 随机快排（Lec 18） | Las Vegas | $\mathsf{ZPP}$ |
> | 随机选择 Rand-Select（Lec 18） | Las Vegas | $\mathsf{ZPP}$ |
> | $n$-后随机回溯（Lec 18） | Las Vegas | $\mathsf{ZPP}$ |
> | 主元素测试（Lec 18） | Monte Carlo, **弃真型** | $\mathsf{RP}$ |
> | 字符串相等指纹法（Lec 18） | Monte Carlo, **弃真型** | $\mathsf{RP}$ |
> | Rabin–Karp 模式匹配（Lec 18） | Monte Carlo, **弃真型** | $\mathsf{RP}$ |
> | `Ptest2`（费马随机化） | Monte Carlo, **取伪型** | $\mathsf{coRP}$（在非 Carmichael 输入上） |
> | Miller–Rabin（Lec 19） | Monte Carlo, **取伪型** | $\mathsf{coRP}$ |

### 5.4 局限性

> **断言 5.8**（随机算法的边界）
> $\mathsf{BPP}$ 是否包含 $\mathsf{NP}$ 是公开问题。**普遍猜测** $\mathsf{NP}\not\subseteq\mathsf{BPP}$——即"加上硬币"不太可能解决 NP-完全问题。
>
> 又：$\mathsf{P}=\mathsf{BPP}$ 也是公开问题；许多结果（如 derandomization、Impagliazzo–Wigderson）让人**猜测 $\mathsf{P}=\mathsf{BPP}$**，即随机性可在多项式开销内"去除"。

> [!note] 课程层面的取舍
> 本课只需会**判断一个新算法属于哪个类**、**单次错误率与 Boost 推出的多次错误率**、**两种单侧错误的区分**。形式语言侧（图灵机、$\mathsf{NP}\stackrel?\subseteq\mathsf{BPP}$）是计算理论课的深度。

---

## 6. 第 12 章序：处理难解问题的策略

随机化是"软化最坏情形保证"的一种手段；对 **NP-难** 问题，还有其它五大类策略。本节列出第 12 章地图，作为后续学习的总目录。


### 6.1 限制输入

通过**限制输入子类**让原本 NP-完全的问题变成 P。

| 问题 | 限制 | 复杂度 |
|---|---|---|
| SAT | **2SAT**（每子句 $\le 2$ 文字） | $\mathsf P$ |
| SAT | **HornSAT**（每子句最多 1 个正文字） | $\mathsf P$ |
| 顶点三着色 | 度 $D\le 2$ | $\mathsf P$ |
| 顶点三着色 | 度 $D\ge 3$ | $\mathsf{NPC}$ |
| Hamiltonian Circuit (HC) | 度 $\le 2$ | $\mathsf P$ |
| HC | 度 $\ge 3$ | $\mathsf{NPC}$ |
| 反馈顶点集 | 度 $\le 2$ | $\mathsf P$ |
| 反馈顶点集 | 度 $\ge 3$ | $\mathsf{NPC}$ |
| 团（Clique） | 任意 $D$ | $\mathsf{NPC}$ |

> [!example] 2SAT ∈ P 的直觉
> 2SAT 实例可建"蕴含图"——子句 $(\ell_1\lor\ell_2)$ 等价于两条边 $\neg\ell_1\Rightarrow\ell_2$ 与 $\neg\ell_2\Rightarrow\ell_1$。**实例可满足 $\iff$ 不存在变量 $x_i$ 与 $\neg x_i$ 在同一强连通分量**——线性时间用 Tarjan 算法判断。
>
> 3SAT 的蕴含图就退化失效，因为子句变三元、不再能改写成简单边。

> [!example] HornSAT ∈ P 的直觉
> Horn 子句 $\neg a_1\lor\dots\lor\neg a_k\lor b$ 等价于规则 "$a_1\land\dots\land a_k\Rightarrow b$"。算法：把所有"事实"（无前提的 $\Rightarrow b$）标为真，反复前向传播；若推出某子句违反则不可满足。线性时间。
>
> 这条性质是 Prolog 等逻辑编程语言的核心。

### 6.2 固定参数算法（FPT）

> **定义 6.1**（FPT，Fixed-Parameter Tractable）
> 输入 $(x, k)$，$|x|=n$。若存在算法在 $O\bigl(f(k)\cdot n^c\bigr)$ 时间内解决该问题，其中 $f$ 仅依赖 $k$、$c$ 与 $k$ 和 $n$ 无关，则该问题在参数 $k$ 下属于 **FPT**。

**关键洞察**：把硬度从"$n$"挪到了"$k$"。当 $k$ 较小时，即便 $f(k)=2^k$ 也只需"指数 in 小数 + 多项式 in 大数"。

> [!example] 顶点覆盖 VC ∈ FPT，$O(2^k k n)$ 算法
> **问**：给定图 $G$ 与 $k$，是否存在 $\le k$ 个顶点覆盖所有边？
>
> **朴素穷举**：对每个 $k$ 元顶点子集判定（$\binom n k$ 个，$n^k$ 量级）—— $O(k\binom n k)=O(kn^k)$，并非 FPT（$n$ 与 $k$ 复合在指数）。
>
> **分支搜索 $O(2^k kn)$**：
> 1. 任取一条边 $(u,v)$。覆盖它必须**至少**选择 $u$ 或 $v$。
> 2. 分两支递归：选 $u$ → 把 $u$ 与其关联边删去，剩下问题用 $k-1$ 解；选 $v$ → 类似。
> 3. 递归深度 $\le k$；每层两支 $\Rightarrow 2^k$ 个叶子。
> 4. 每个节点 $O(kn)$ 处理（找一条未覆盖的边、删点删边）。
> 5. 总时间 $O(2^k\cdot kn)$。
>
> 当 $k$ 是小常数（如 20），$2^{20}\cdot kn\approx 10^6\cdot kn$，对 $n=10^4$ 仍现实可解。这就是 FPT 的实战价值。

### 6.3 改进的指数时间算法

> **记号 6.2**（$O^*$）
> $O^*(g(n))$ 表示**忽略多项式因子**的指数阶估计，即 $O^*(g(n))=O(\mathrm{poly}(n)\cdot g(n))$。

> **定义 6.3**（非平凡 / 改进的指数时间算法）
> 若一个问题的朴素穷举为 $O^*(2^n)$，则任何 $1<c<2$ 的常数下 $O^*(c^n)$ 算法称为**非平凡的指数时间算法**。

**例**：
- 3SAT：$O^*(1.8393^n)$（2010 年前结果），$O^*(1.321^n)$ 随机算法 / $O^*(1.439^n)$ 确定型。
- 顶点着色：$O^*(3^n)$（任意色数）。
- 背包：比朴素 $O^*(2^{n/2})$ 更好的算法存在。
- TSP：比 $O^*(2^n)$ 更好的算法（Held–Karp 即 $O^*(2^n)$，已有进一步改进）。

> **猜想 6.4**（指数时间假设 ETH）
> 对每个 $k\ge 3$ 都存在常数 $c_k>0$，使**精确**求解 $k$-SAT 的时间复杂性
> $$\ge 2^{c_k n}. \tag{6.1}$$
> 这是计算复杂性中比 $\mathsf P\ne\mathsf{NP}$ 更强的假设——但目前公认成立，被用来证明大量精细下界。

### 6.4 启发式方法

> **定义 6.5**（Heuristic）
> 目前无法从理论上给出任何性能保证、但在**实践**中效果良好的方法。

常见：
- **回溯与分支限界**（Lec 6）。
- **局部搜索**：贪心地交换邻域中的元素。
- **随机化策略 / 重启策略**：跳出局部最优。
- **模拟退火**（Simulated Annealing）：以 $\exp(-\Delta E/T)$ 概率接收恶化解，$T$ 慢慢降低。
- **遗传算法**：编码 + 选择 + 交叉 + 变异。

> [!warning] 与近似算法的本质差别
> 近似算法（Lec 16–17）**有可证明的近似比**（如 MVC 的 2、度量 TSP 的 3/2）；启发式**没有任何保证**——再坏的输入下可能给出任意差的解。但工程上常以"实践跑得快、解还行"为采纳标准。

### 6.5 平均情形复杂度

> **思想**：放弃"最坏情形"刻画，看典型输入分布下的平均行为。

**例子**：**Hamiltonian Circuit 在随机图 $G(n,1/2)$** 上的平均情形为 $O(n^3)$，远低于最坏情形 NP-完全。

> **定义 6.6**（Erdős–Rényi 随机图 $G(n,p)$）
> 在 $n$ 个顶点上，**独立**地以概率 $p$ 在每对顶点间放一条边。$G(n,1/2)$ 是其中最常用的"对称随机图"。

> **概念 6.7**（DistNP / DistNP 完全）
> 把"输入分布"也作为问题的一部分——对$\langle$问题，分布$\rangle$对刻画**平均情形难度**。有一类 $\mathsf{DistNP}$-完全问题在平均情形下也是 NP 难。

### 6.6 难解算例生成与统计物理

- 怎样**构造**真正难的实例？这本身就是研究领域（用于评估算法）。
- 在 SAT 等约束满足问题中，**相变现象**（子句/变量比 $\approx 4.267$ 时 3SAT 最难）被广泛研究。
- **基于统计物理的消息传递算法**（Belief Propagation, Survey Propagation）能在某些"难解算例"附近取得突破。

---

## 7. 本讲总结

回到期末复习语境，这一讲最重要的不是背完整证明，而是能说清楚“为什么普通费马测试不够、Miller-Rabin 多了哪条判别、随机复杂度类如何按错误类型分类、NP 难问题还能用哪些现实策略缓解”。

> [!tip] 期末复习要点（高密度版）
> 1. **`ExpMod` 位复杂度 $O(\log^3 n)$**：主循环 $\log n$ 轮，每轮平方 + 取模 $O(\log^2 n)$。
> 2. **费马小定理（必要、非充分）+ Carmichael 反例**：单凭费马为何不行的一句话回答。
> 3. **Theorem 1.4 推论**：$x^2\equiv 1\pmod n$ 有非平凡根 $\Rightarrow$ $n$ 合数。Miller–Rabin 的判合数依据。
> 4. **`PremalityTest` 总复杂度 $O(\log^4 n)$，错率 $\le 1/n$**：单次 $O(\log^3 n)$、错率 $\le 1/2$，重复 $k=\log n$ 次。
> 5. **ZPP / RP / coRP / BPP** 四类定义，并能给一个算法分类（如"Miller–Rabin ∈ coRP"，"随机快排 ∈ ZPP"）。
> 6. **单侧错误两形态**：弃真型（接受时一定对，例：主元素）；取伪型（拒绝时一定对，例：Miller–Rabin）。
> 7. **VC FPT 算法 $O(2^k kn)$**：分支搜索的两路递归 + 深度 $k$ 论证。
> 8. **2SAT / HornSAT ∈ P** 的存在；**3SAT 是 NPC** 不可一并改写。
> 9. **ETH 表述**：对每个 $k\ge 3$ 存 $c_k>0$，$k$-SAT 时间下界 $\ge 2^{c_k n}$。

> [!warning] 易错点合集
> - **`Ptest1`/`Ptest2` 单次错率上界**只在**非 Carmichael 数**上成立；Carmichael 让 `Ptest2` 几乎必错。Miller–Rabin 没有这个例外。
> - **错率 $1/n$ vs $1/2^k$**：取 $k=\log n$ 才能从 $(1/2)^k$ 推出 $1/n$；改 $k$ 就改错率。
> - **复杂度类区分**：$\mathsf{RP}$ 接受时绝对对，$\mathsf{coRP}$ 拒绝时绝对对。**搞反了**就把 Miller–Rabin 错分类。
> - **FPT 不是"在 P"**：$k$ 固定时多项式，**变 $k$ 时仍指数**。VC 在 $k=n/2$ 时仍 $2^{n/2}$。
> - **改进指数 $O^*(c^n)$ vs 多项式**：$c<2$ 仍是指数，**不能说是高效算法**——只是相对蛮力 $2^n$ 改进。

---

## 8. 记号速查

| 记号 | 含义 |
|---|---|
| $a\equiv b\pmod n$ | $n\mid(a-b)$，同余 |
| $a^{n-1}\pmod n$ | 模幂运算结果 |
| $n-1=2^q m$，$m$ 奇 | Miller–Rabin 分解，$q=\nu_2(n-1)$ |
| $\mathsf{ZPP},\mathsf{RP},\mathsf{coRP},\mathsf{BPP}$ | 随机复杂度类 |
| $O^*(c^n)$ | 指数阶忽略多项式因子 |
| $G(n,p)$ | Erdős–Rényi 随机图模型 |
| $\mathsf{ETH}$ | 指数时间假设 |
| $\nu_2(k)$ | $k$ 的二进制末尾零的个数 |
| $a\bmod n$ / $a\%n$ | 取模 |
| $\binom n k$ | 二项系数 |
| FPT | Fixed-Parameter Tractable |
| Carmichael 数 | 对所有 $a$ 互素满足费马的合数 |
| 弃真型 | one-sided rejecting；接受绝对对 |
| 取伪型 | one-sided accepting；拒绝绝对对 |

---

## 9. 中英对照术语

| 中文 | English |
|---|---|
| 随机算法 | Randomized Algorithm |
| 拉斯维加斯型 | Las Vegas |
| 蒙特卡洛型 | Monte Carlo |
| 素数检验 | Primality Testing |
| 费马小定理 | Fermat's Little Theorem |
| 模幂 | Modular Exponentiation |
| 伪素数 | Pseudoprime |
| 卡迈克尔数 | Carmichael Number |
| 非平凡平方根 | Non-trivial Square Root of 1 |
| Miller–Rabin 算法 | Miller–Rabin Primality Test |
| 单侧错误 | One-sided Error |
| 弃真型 / 取伪型 | Rejecting / Accepting one-sided |
| 双侧错误 | Two-sided Error |
| 复杂度类 | Complexity Class |
| 有效算法 | Efficient Algorithm |
| 固定参数算法 | Fixed-Parameter Tractable (FPT) |
| 顶点覆盖 | Vertex Cover (VC) |
| 反馈顶点集 | Feedback Vertex Set |
| 顶点三着色 | 3-Coloring |
| 哈密顿回路 | Hamiltonian Circuit |
| 改进的指数时间算法 | Improved Exponential-Time Algorithm |
| 指数时间假设 | Exponential Time Hypothesis (ETH) |
| 启发式 | Heuristic |
| 模拟退火 | Simulated Annealing |
| 遗传算法 | Genetic Algorithm |
| 平均情形复杂度 | Average-case Complexity |
| Erdős–Rényi 随机图 | Erdős–Rényi Random Graph |
| 难解算例 | Hard Instance |
| 消息传递算法 | Message-Passing Algorithm |

---

> [!note] 与 Lec 18 的链路
> Lec 18 把"随机化"作为**算法设计范式**首次系统引入（两类范式 + Boost）；Lec 19 用它做了一个**有重大应用价值**的判定问题（密码学基石）、并把"随机化"**收口到复杂度理论**。再往下，第 12 章不再依赖随机化作单一武器，而是把面对 NP-难时的所有手段（限制 / 参数 / 指数 / 启发 / 平均 / 物理）展现为一个工具箱。**这是本课的最后一讲，也是"算法设计与分析"全课程的合龙**。
