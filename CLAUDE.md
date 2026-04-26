# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 晓蓓，这是小蚂蚁所有新项目的标准起点。不要改技术栈，不要自己发挥。

---

## 这个模板是什么

bugu-template — A 轻量版标准框架。每次新项目从这里生成，不从零搭。
使用前：把 `bugu-template` 改成项目名，填 `.env.local`，就能跑。

---

## 技术栈（固定，不换）

| 层 | 选型 |
|----|------|
| 框架 | Next.js 15 (App Router + TypeScript) |
| 样式 | Tailwind CSS |
| 组件 | Shadcn UI（用 `npx shadcn@latest add` 按需加组件） |
| 动效 | Framer Motion（按需加 Aceternity 单组件） |
| 数据库 | Supabase（含 Auth + pgvector） |
| AI | Anthropic SDK（直接调，不过 LangChain） |
| Embedding | Voyage AI（需要 RAG 时才用） |
| 部署 | Docker + 阿里云新加坡 1Panel |

---

## UI 风格方向（每个项目开工前选其一）

选了就只走这条路，不混用。

### Option A：Calm（冷静克制）
参考：Linear / Vercel
气质：深色背景 + 锋利边框 + 强排版，极简，专注内容
适合：工具类、效率类、To B 产品
色系：深灰/黑 + 白字 + 单色 Accent（见 tailwind.config.ts `calm` 色组）

### Option B：Warm Glass（有温度的玻璃感）
参考：delight.ai
气质：半透明磨砂卡片、有温度的背景图、浮层层次感
适合：情感类、品牌感强、To C 产品
色系：暖色背景图 + 玻璃浮层（用 `.glass-card` 工具类，见 globals.css）

---

## UI 六层拆解（找参考、做决策时用这个框架）

1. **基础视觉** — 背景、配色系统、字体（定气质，最先定）
2. **基础组件** — 按钮、输入框、标签、图标
3. **复合组件** — 卡片、弹窗、导航栏、表单
4. **布局** — 栅格、间距节奏、视线流动
5. **动效** — hover 反馈、入场、页面切换
6. **整体氛围** — 光影、质感、圆角、阴影风格（最先定）

先定第 1 层和第 6 层，再往中间填。

---

## 特效组件取件原则

Aceternity UI / Magic UI / Eldora UI 都是复制代码模式，按需取单组件。

**每个项目只选一个主参考，其他最多用一处补充。**
目标是 Calm Technology——每个动效都有目的，不堆砌。

灵感参考：Godly.website · Awwwards · Lapa Ninja
组件取件：ui.aceternity.com · magicui.design · eldoraui.site · reactbits.dev

工作流：找到喜欢的网站 → 截图或网址发给晓蓓 → 分析风格 / 识别库 / 复刻代码 → 边跑边调。

---

## 本地启动

```bash
cp .env.example .env.local
# 填入 SUPABASE_URL、SUPABASE_ANON_KEY、ANTHROPIC_API_KEY

npm install
npm run dev
```

开发时直接 `npm run dev`，不用 Docker。Docker 只在准备部署时用。

---

## 目录说明

```
app/
  layout.tsx          # 全局布局，改标题和字体
  page.tsx            # 首页，从这里开始写
  globals.css         # 全局样式 + CSS 变量 + glass 工具类
  api/chat/route.ts   # AI 对话接口（流式），已接好 Anthropic SDK

lib/
  anthropic.ts        # Anthropic 客户端（服务端专用）
  supabase.ts         # Supabase 客户端（浏览器端）
  supabase.server.ts  # Supabase 客户端（服务端/API Route）
  utils.ts            # cn() 工具函数，Shadcn 必须

components/ui/        # Shadcn 组件放这里
```

---

## 加 Shadcn 组件

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input
```

---

## 部署到新加坡

```bash
docker compose up --build   # 本地验证
docker compose up -d        # 服务器上跑
```

新网站必须通过 1Panel 创建站点，绑域名、开 HTTPS，不要直接写 nginx 配置。

部署后健康检查：
```bash
curl -s -o /dev/null -w "%{http_code}" https://你的域名
```

---

## Key 安全

- `ANTHROPIC_API_KEY`、`VOYAGE_API_KEY`：只在服务端用，绝不加 `NEXT_PUBLIC_` 前缀
- `NEXT_PUBLIC_SUPABASE_*`：前端可读，Supabase RLS 策略保证安全
- `.env.local` 已在 `.gitignore`，不会提交

---

*bugu-template · 最后更新：2026-04-26 晓蓓*
