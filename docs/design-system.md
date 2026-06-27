# 视觉设计系统 — 赛博霓虹（Cyber Neon）

三端（Web / App）共享的设计语言，作为重设计的唯一事实来源。灵感取向：Google Stitch 的现代克制结构 + 赛博朋克霓虹高对比。配合"黑金/赛博朋克"海报调性。

## 设计原则（落实 redesign 审计）
- **单主强调色 + 双色霓虹点缀**：青色为主操作色，品红仅作稀疏高光/渐变伙伴，禁止满屏双强调。
- **去掉旧的紫色 AI 渐变**（`#7c5cff`）与 system-ui 默认字体。
- **深空近黑底 + 冷灰阶**（统一冷色调，勿混暖灰）。
- **辉光替代普通黑色阴影**：阴影带青/品红色相。
- **微噪点叠层**打破数字平面感（固定、pointer-events:none）。
- 完整的 hover / active / focus / loading(骨架) / empty / error 状态；过渡 180–260ms，仅用 transform/opacity。
- 句子式标题（非 Title Case），大标题负字距、紧行高。

## 颜色令牌

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#07070d` | 近黑主背景 |
| `--bg-soft` | `#0d0d18` | 次级背景 |
| `--surface` | `#12121f` | 卡片/面板 |
| `--surface-2` | `#1a1a2b` | 悬浮/输入 |
| `--border` | `#26263c` | 冷色描边 |
| `--text` | `#eaeaf6` | 主文字 |
| `--text-dim` | `#8c8ca6` | 次文字 |
| `--neon-cyan` | `#22e3ff` | **主强调**：主按钮、链接、聚焦环、激活态 |
| `--neon-cyan-deep` | `#0bb8d6` | 青色按下/描边 |
| `--neon-magenta` | `#ff2ea6` | 点缀高光、渐变伙伴（稀疏使用） |
| `--success` | `#28e0a0` | 成功 |
| `--danger` | `#ff4d6d` | 错误/危险 |
| `--warn` | `#ffcf4d` | 提示 |

辉光阴影：
```
--glow-cyan: 0 0 0 1px rgba(34,227,255,.35), 0 8px 30px -8px rgba(34,227,255,.45);
--glow-magenta: 0 0 24px -6px rgba(255,46,166,.5);
--shadow-soft: 0 10px 30px -12px rgba(8,8,20,.8);   /* 冷色相阴影，非纯黑 */
```
强调渐变（仅用于英雄区/主按钮，避免 45° 均匀渐变）：
```
--grad-neon: radial-gradient(120% 120% at 0% 0%, #22e3ff 0%, #2a6bff 38%, #ff2ea6 100%);
```

## 字体

- 展示/标题：**Chakra Petch**（科技感、含拉丁字形）— 大标题用 600/700，负字距 -0.02em，行高 1.05。
- 正文/UI：**Sora**（300–600）。
- 数字/数据：**JetBrains Mono** 或 `font-variant-numeric: tabular-nums`。
- CJK 回退：`'PingFang SC','Noto Sans SC','Noto Sans JP','Noto Sans KR','Microsoft YaHei', sans-serif`。

Web：通过 Google Fonts `<link>`（`Chakra+Petch`, `Sora`, `JetBrains+Mono`）。
App：`google_fonts` 包（`chakraPetch`, `sora`），数字用等宽。

## 形状与层次
- 圆角分层：容器 `--r-lg:16px`，卡片 `--r:12px`，内元素 `--r-sm:8px`，胶囊仅用于标签。
- 1px 内描边 + 辉光模拟边缘折射（玻璃质感）。
- 用负边距制造重叠层次，避免纯并排扁平。

## 动效
- 入场：Y 轴位移 + 透明度，错峰 stagger（40–80ms 递延）。
- 交互：hover 提升辉光/微缩放 1.02；active `scale(.98)`；focus 可见青色聚焦环。
- `scroll-behavior: smooth`。

## 组件基线
- 主按钮：青色实心或 `--grad-neon`，hover 辉光增强；幽灵按钮：透明 + 青色描边。
- 卡片：仅在需要层次时存在；用背景 + 辉光而非"边框+阴影+白底"老三样。
- 标签：方形/切角，而非统一胶囊。
- 加载：与布局同形的骨架屏（带霓虹微光扫过），不用通用转圈。
- 空状态：有引导的"开始调制"组合视图。
- 错误：行内直述（"连接失败，请重试"），不用 alert / 不用"Oops!"。

## Google Stitch 风格特征（自动套用）
注：Stitch 为需登录的交互式工具、无公开 API，无法在此自动调用；以下是对其产出风格的提炼，agent 据此实现，效果对齐 Stitch 输出。
- **强结构网格**：CSS Grid 主导、统一的 8pt 间距节律、清晰的分区与留白。
- **大而克制的标题层级**：单屏一个主标题、明确的次级标题与说明文字三级层次。
- **现代 Material 影响**：圆角、柔和层次、状态清晰的组件，但去掉默认 Material 蓝、改用本系统霓虹青。
- **内容优先卡片**：信息密度适中、卡片只在传达层次时出现。
- **移动优先响应式**：单列→多列自适应，触控目标≥44px。
- **一致图标族**：统一描边粗细（用 Phosphor 风格，不混用 Lucide/Feather 默认集）。

## 可访问性
- 聚焦环必现（青色 2px outline + offset）。
- 文本对比度达标；霓虹色仅用于强调，不用于长正文。
- 图片 alt、语义标签、skip-to-content。
