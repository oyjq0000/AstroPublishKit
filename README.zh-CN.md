# AstroPublishKit

<p align="center">
  <a href="README.md">English</a> ·
  <strong>简体中文</strong>
</p>

[![CI](https://github.com/oyjq0000/AstroPublishKit/actions/workflows/ci.yml/badge.svg)](https://github.com/oyjq0000/AstroPublishKit/actions/workflows/ci.yml)
[![Astro 7](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个干净、静态优先的 Astro 发布模板，适合博客、技术笔记和内容型网站。

**在线演示：** https://astropublishkit.pages.dev/

<p align="center">
  <a href="https://astropublishkit.pages.dev/">
    <img src="docs/assets/demo-home.png" alt="AstroPublishKit 在线演示首页" />
  </a>
</p>

AstroPublishKit 更偏向一个 **发布套件（publishing kit）**，而不只是一个主题：内容模型、搜索、SEO / 内容发现、质量检查和部署默认配置都已经准备好，同时视觉层保持轻量，方便替换成你自己的设计。

## 功能

- Astro 7 + Markdown / MDX + 类型安全的 Content Collections
- 响应式界面，支持浅色 / 深色模式
- 文章、分类、标签、归档和阅读时长
- Pagefind 静态搜索，无需独立搜索服务
- 目录、分享、返回顶部、Callout、Accordion、视频组件
- Canonical、Open Graph、Twitter Cards 和 JSON-LD
- Sitemap，支持 `lastModified` 和 `noindex` 过滤
- RSS、robots.txt 和 llms.txt
- 可选 Giscus、Cloudflare Web Analytics 和 Umami，默认全部关闭
- `new-post`、内容检查、安全检查和单元测试
- GitHub Actions CI
- 支持 Cloudflare Pages 和 Workers Static Assets 部署

默认不需要数据库、后台管理系统、SSR Runtime、生产统计账号，也不会携带任何私人站点内容。

## 快速开始

环境要求：Node.js 22.13+。

可以直接点击 GitHub 的 **Use this template** 创建新仓库，也可以普通 clone：

```bash
git clone https://github.com/oyjq0000/AstroPublishKit.git
cd AstroPublishKit
npm install
npm run dev
```

然后修改 `astro-publish-kit.config.mjs`，替换 Demo 中的站点信息。

创建一篇草稿：

```bash
npm run new-post -- my-first-post
```

运行完整发布检查：

```bash
npm run check
```

最终静态文件输出到 `dist/`，构建过程中会同时生成 Pagefind 搜索索引。

## 配置

主要配置入口是：

```text
astro-publish-kit.config.mjs
```

可以在这里设置站点名称、Canonical URL、作者、导航、社交链接、语言区域和首页文案。

正式部署时，请显式设置生产站点地址：

```bash
SITE_URL=https://your-domain.example
```

源码里故意保留 `https://example.com` 作为兜底值，避免别人复制模板后，在未配置自己的域名时错误地把 AstroPublishKit Demo 地址当成 Canonical。

可选第三方集成的环境变量请参考 `.env.example`。对应变量为空时，相关功能不会加载。

## 内容

文章放在：

```text
src/content/posts/
```

最小 Frontmatter 示例：

```yaml
---
title: 我的第一篇文章
description: 一段可以独立用于读者预览和搜索结果的文章摘要。
date: 2026-08-31
category: Engineering
tags: [Astro]
draft: false
noindex: false
---
```

完整字段和 MDX 组件说明请查看 `docs/content.md`。

## Cloudflare Pages

公开 Demo `astropublishkit.pages.dev` 从 `main` 分支自动部署，配置如下：

| 配置项 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| `SITE_URL` | Demo 使用 `https://astropublishkit.pages.dev`；你的项目应填写自己的正式域名 |
| `NODE_VERSION` | `22.13.0` 或更新的 Node 22 |

启用 Git 集成后，每次向生产分支 push 都会触发新的 Pages 部署。

## Cloudflare Workers Static Assets

仓库同时提供 `wrangler.jsonc`，其中 `assets.directory` 指向 `./dist`。修改项目名并配置 `SITE_URL` 后运行：

```bash
npm run deploy:cf
```

默认项目完全预渲染，因此不需要 Worker 入口文件，也不需要 `@astrojs/cloudflare` Adapter。

更多部署说明见 `docs/deployment.md`。

## 项目检查

```bash
npm run typecheck
npm run test
npm run check:content
npm run check:safety
npm run build
```

`npm run check` 会依次执行整套发布检查。CI 也使用同一套门禁。

`check:safety` 会扫描公开实现中的生产标识和常见敏感信息模式。审计与来源记录文档不参与应用运行。

## 项目结构

```text
src/content/posts/              Markdown / MDX 文章
src/components/                 小型通用 UI / MDX 组件
src/pages/                      静态路由与 Feed
src/styles/global.css           可替换的视觉层
astro-publish-kit.config.mjs    主要站点配置
scripts/                        写作和质量检查脚本
docs/                           内容、定制和部署文档
```

## 当前范围

`feature-matrix.md` 是当前版本的功能边界。初始版本明确不包含：

- 数据库和 CMS 后端
- 用户认证
- 任何个人站点迁移工具
- 内置广告账号
- 批量 AI 文章生成
- 游戏 / Wiki 专用组件
- 对 AstroPaper、Fuwari、Retypeset 或 AnvilWiki 视觉设计的复制

## 来源与审计

这个仓库拥有独立的 Git 历史。项目是在审计现有 Astro 博客并研究多个公开项目后重新构建的，没有复制私人文章、站点历史或私有资产。

详细记录：

- `source-audit.md`
- `reference-projects.md`
- `feature-matrix.md`
- `THIRD_PARTY_NOTICES.md`

## 许可证

MIT。第三方来源和署名请查看 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。
