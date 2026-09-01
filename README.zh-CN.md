# AstroPublishKit

<p align="center">
  <a href="README.md">English</a> ·
  <strong>简体中文</strong>
</p>

[![CI](https://github.com/oyjq0000/AstroPublishKit/actions/workflows/ci.yml/badge.svg)](https://github.com/oyjq0000/AstroPublishKit/actions/workflows/ci.yml)
[![Astro 7](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个干净、静态优先的 Astro 发布 Starter，适合博客、技术笔记和内容型网站。

**在线演示：** https://astropublishkit.pages.dev/

<p align="center">
  <a href="https://astropublishkit.pages.dev/">
    <img src="docs/assets/demo-home.png" alt="AstroPublishKit 在线演示首页" />
  </a>
</p>

AstroPublishKit 优先解决的是 **发布基础设施**：

- ✓ 类型化内容模型
- ✓ Markdown / MDX 写作
- ✓ 静态搜索与 SEO / 内容发现输出
- ✓ 本地写作辅助工具
- ✓ 强质量门禁
- ✓ 静态部署默认配置

自带视觉层刻意保持轻量，方便替换。默认构建结果就是 `dist/` 中的普通静态文件；不需要数据库、CMS、Node 服务、SSR Runtime 或托管搜索后端。

<p align="center">
  <img src="docs/assets/publishing-pipeline.svg" alt="AstroPublishKit 从 Markdown 和 MDX 到 Cloudflare 静态部署的发布流水线" />
</p>

## 5 分钟完成配置

环境要求：Node.js 22.22.3+。

1. 在 GitHub 点击 **Use this template**（推荐），或普通 clone。
2. 使用 `npm ci` 安装 lockfile 锁定的依赖。
3. 修改 `astro-publish-kit.config.mjs`，替换 Demo 身份信息。
4. 在生产构建前，把 `SITE_URL` 设置为你的生产 HTTPS Origin。
5. 使用 `npm run new-post`，或 `npm run new-post -- my-first-post` 创建 draft。
6. 使用 `npm run dev` 写作并预览。
7. 运行 `npm run check`，把 `draft` 改为 `false`，再构建最终静态输出。

```bash
git clone https://github.com/oyjq0000/AstroPublishKit.git
cd AstroPublishKit
npm ci
npm run new-post
npm run dev
```

> **生产环境必填：** 部署前必须设置 `SITE_URL`。缺失或仍为 `https://example.com` 时，`npm run build:production` 会主动失败。

`SITE_URL` 决定 Canonical、Sitemap、RSS、robots.txt、JSON-LD、llms.txt、Open Graph 与分享 URL 使用的生产 Origin。

## 写作与发布流程

v0.2.0 把本地写作路径收敛成几个明确步骤：

```bash
# 交互式创建 draft
npm run new-post

# 或继续使用快速非交互模式
npm run new-post -- my-post

# 查看当前未发布文章
npm run drafts

# 写作与本地预览，也支持直接预览 draft URL
npm run dev

# 完整 Release Gate
npm run check

# 最终静态产物 + Pagefind 预览
npm run build
npm run preview
```

新文章默认 `draft: true`。在 `npm run dev` 中，可以直接访问 `/posts/<slug>/` 预览 draft，而不必先把它公开；production build 仍然会完全排除 draft。

文章准备好后，把 `draft` 改成 `false`，运行检查，然后使用真实域名执行生产 smoke build：

```bash
SITE_URL=https://your-domain.example npm run build:production
```

完整的 create → write → preview → check → publish 流程见 **[Writing workflow](docs/writing-workflow.md)**。

如果是迁移已有站点，请先阅读 **[Existing blog → AstroPublishKit migration checklist](docs/migration-checklist.md)**；内容能成功构建，并不代表旧 URL、图片资产和 SEO 连续性会自动保留。

## 功能

- Astro 7 + Markdown / MDX + 类型化 Content Collections
- 交互式 `new-post`，同时保留兼容的非交互模式
- Markdown / MDX 创建、slug 合法化和重复文件保护
- `npm run drafts` 与仅开发环境可用的 draft 直接预览
- 响应式浅色 / 深色界面与移动端导航
- 文章、分类、标签、归档、阅读时长和文章元数据
- 可选的文章 Summary / Quick Answer 摘要块
- 基于精确共享标签与分类、在构建阶段生成的确定性 Related Posts
- 同一精确分类内、按发布时间确定的 Previous / Next 文章导航
- Pagefind 静态搜索
- TOC、分享、返回顶部
- Callout、Accordion、YouTube MDX 组件
- Canonical、Open Graph、Twitter Cards 和 JSON-LD
- Sitemap，支持 `lastModified` 和 `noindex` 过滤
- RSS、robots.txt 和 llms.txt
- 可选 Giscus、Cloudflare Web Analytics 和 Umami，默认关闭
- ESLint、Prettier、配置/内容/链接/Sitemap/安全检查、单元测试与模板回归检查
- 面向作者的内容诊断：错误、警告、修复提示和最终汇总
- Markdown 正文图片 URI 可移植性检查，阻止本机文件路径和非 Web scheme
- 使用统一 Release Gate 的 GitHub Actions CI
- Cloudflare Pages，以及可选的 Workers Static Assets 部署

## 界面预览

文章页：TOC、元数据和 MDX Callout。

<p align="center">
  <img src="docs/assets/demo-article.png" alt="AstroPublishKit article page" />
</p>

Pagefind：直接从静态构建产物生成搜索结果。

<p align="center">
  <img src="docs/assets/demo-search.png" alt="AstroPublishKit Pagefind search results" />
</p>

390px 移动端：展开原生导航菜单后的实际布局。

<p align="center">
  <img src="docs/assets/demo-mobile.png" width="390" alt="AstroPublishKit mobile navigation and homepage" />
</p>

## 配置

主要站点配置文件是 `astro-publish-kit.config.mjs`。它负责站点名称、作者、仓库 / 社交链接、导航、品牌标记与静态资源、版权和首页文案；`SITE_URL` 单独提供生产 Origin。

完整字段和 Required / Recommended / Optional 划分见 **[配置参考](docs/configuration.md)**。

可选集成的环境变量在 `.env.example` 中说明；变量为空时不会加载相应功能。

## 内容模型

文章放在 `src/content/posts/`，支持 `.md` 和 `.mdx`。

生成器使用固定且一致的 Frontmatter 顺序；`lastModified`、`author`、`cover` 等可选字段只在需要时添加。

```yaml
---
title: "我的第一篇文章"
description: "一段可以独立用于读者预览和搜索结果的文章摘要。"
summary: "可选的简短直接答案，会显示在文章顶部附近。"
date: 2026-08-31
category: "Engineering"
tags: ["Astro"]
draft: true
noindex: false
featured: false
lang: "en"
---
```

几个容易误解的语义：

- `category` 是一个宽泛栏目；`tags` 是零个或多个更具体主题。
- `summary` 是可选纯文本，用于页面可见的 Quick Answer；它和继续服务 metadata / 列表的 `description` 是两个不同字段。
- Related Posts 不需要额外 Frontmatter：构建时只从可发现的已发布文章中，按精确共享 `tags` 与 `category` 自动排序；不需要后端、AI 推荐服务或手工 related-post ID。
- Previous / Next 同样不需要额外 Frontmatter：同一精确 `category` 中的可发现文章按发布时间形成确定性时间线，Previous 指更旧一篇，Next 指更新一篇。
- `author` 可选。不填时继承站点作者；填写时仅覆盖当前文章作者。
- v0.2.0 中 `lang` 仍然只是文章元数据，**不会**开启多语言路由、UI 翻译、fallback 或 hreflang。
- `draft: true` 只会在 `npm run dev` 时允许通过直接 URL 预览；production output 不生成该页面。
- `noindex: true` 仍会生成已发布页面，但会从 Sitemap、Pagefind 和 llms.txt 的发现链路中排除，并输出 robots `noindex`。

封面可采用推荐但不强制的目录约定 `public/images/posts/<slug>/`；Frontmatter 使用 public-root URL，例如 `/images/posts/my-post/cover.webp`。只要设置了 `cover`，`alt` 就必须非空；未设置 cover 时使用配置中的默认 OG 图，Starter 默认是 `public/og.png`。

完整 Frontmatter 与封面说明见 **[内容写作说明](docs/content.md)**，三个可选 MDX 组件见 **[MDX components](docs/mdx-components.md)**。

### Pagefind 与预览

Pagefind 索引由 `npm run build` 生成。`npm run dev` 适合快速写作预览；完整静态搜索索引应使用：

```bash
npm run build
npm run preview
```

不额外增加 preview 包装命令，这两个现有模式已经分别覆盖写作和发布前预览。

## 质量门禁

`npm run check` 是本地和 CI 共用的唯一 Release Gate。

| 检查                     | 作用                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `npm run typecheck`      | Astro / TypeScript 正确性                                      |
| `npm run lint`           | JS、MJS、TS、Astro 的 ESLint 检查                              |
| `npm run format:check`   | 使用 Prettier 校验格式但不修改文件                             |
| `npm run test`           | URL、内容、taxonomy、Related Posts、authoring、文本与 SEO 测试 |
| `npm run check:config`   | 通用站点配置与可选集成验证                                     |
| `npm run check:content`  | 内容约定、图片 URI 可移植性与作者反馈                          |
| `npm run build`          | 最终静态输出 + Pagefind 索引                                   |
| `npm run check:links`    | 离线检查生成后的站内页面链接                                   |
| `npm run check:sitemap`  | Sitemap Origin、页面、排除项、重复 URL 与 `lastmod`            |
| `npm run check:safety`   | 常见 secret 模式与误提交的环境文件                             |
| `npm run check:template` | 使用假用户身份构建并扫描生成站点中的身份残留                   |

CI 执行 `npm ci`，然后执行 `npm run check`。阻塞错误、非阻塞 Warning 与生产 smoke check 的详细说明见 **[质量检查文档](docs/quality-checks.md)**。

## Cloudflare Pages — 推荐

绝大多数用户建议直接把 GitHub 仓库连接到 Cloudflare Pages：

| 配置项         | 值                         |
| -------------- | -------------------------- |
| 生产分支       | `main`                     |
| 构建命令       | `npm run build:production` |
| 构建输出目录   | `dist`                     |
| `SITE_URL`     | 你的生产 HTTPS Origin      |
| `NODE_VERSION` | `22.22.3` 或兼容的 Node 22 |

仓库输出普通静态文件，因此不需要 Cloudflare Adapter。

## Workers Static Assets — 进阶

如果你习惯 Wrangler / CLI 部署，或者以后准备叠加 Worker 能力，可以使用这条路径。修改 Worker 项目名、配置 `SITE_URL` 后执行：

```bash
npm run deploy:cf
```

`wrangler.jsonc` 直接服务 `./dist`，启用 trailing-slash HTML 处理，并让未知路径返回项目自定义 `404.html` 与 HTTP 404。

更多说明见 **[部署文档](docs/deployment.md)**。

## 部署前检查

- [ ] 替换站点标题、描述和作者
- [ ] 替换仓库与社交链接
- [ ] 替换品牌标记和 favicon
- [ ] 替换默认 1200×630 OG 图片
- [ ] 如有需要，替换通用 About 内容
- [ ] 保留、修改或删除 Demo 文章
- [ ] 运行 `npm run drafts`，确认预期发布状态
- [ ] 设置 `SITE_URL`
- [ ] 运行 `npm run check`
- [ ] 运行 `SITE_URL=https://your-domain.example npm run build:production`

## Template 清理

仓库包含演示内容，用来展示 Starter 的能力。以下内容都可以安全替换或删除：

- `src/content/posts/` 中的 Demo 文章
- 主配置中的首页文案
- 通用 About 页面内容
- `public/favicon.svg`
- `public/og.png`

请保留 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。除非你明确要改变 Starter 的契约，否则建议保留配置和 Content Schema 的结构。

## 可选集成

- **Giscus：** 只有全部必要 Giscus 环境变量存在时，才显示在文章正文下方。
- **Cloudflare Web Analytics：** 配置 `PUBLIC_CF_BEACON_TOKEN` 后全站加载。
- **Umami：** Script URL 与 Website ID 同时存在时才全站加载。

仓库不会把生产统计账号标识作为默认配置提交进来。

## 项目结构

```text
src/content/posts/              Markdown / MDX 文章
src/components/                 小型通用 UI / MDX 组件
src/lib/content-rules.mjs       共用写作 / Frontmatter 规则
src/pages/                      静态路由与 Feed
src/styles/global.css           可替换的视觉层
astro-publish-kit.config.mjs    主要站点配置
scripts/                        写作和质量检查脚本
docs/                           写作、内容、配置、质量检查和部署文档
```

## 当前范围

当前 `main` 正在向 v0.3.0 开发，已经包含可选 Summary / Quick Answer、确定性的 Related Posts，以及同分类 Previous / Next 导航；Freshness、FAQ 和自动重定向仍未实现。

当前实现状态以及 v0.3.0+ 候选方向见 **[Feature Matrix](feature-matrix.md)**。

## 来源与署名

仓库拥有独立 Git 历史，并只保留简短、长期有效的来源记录。见 `PROVENANCE.md` 与 `THIRD_PARTY_NOTICES.md`。

## 许可证

MIT。见 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。
