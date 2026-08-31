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

AstroPublishKit 优先解决的是 **发布基础设施**，而不只是提供一个 Theme：

- ✓ 类型化内容模型
- ✓ 静态搜索
- ✓ SEO 与内容发现输出
- ✓ 质量检查
- ✓ 部署默认配置

自带视觉层刻意保持轻量，方便替换。默认构建结果就是 `dist/` 中的普通静态文件；不需要数据库、Node 服务、SSR Runtime 或独立搜索后端。

<p align="center">
  <img src="docs/assets/publishing-pipeline.svg" alt="AstroPublishKit 从 Markdown 和 MDX 到 Cloudflare 静态部署的发布流水线" />
</p>

## 5 分钟完成配置

环境要求：Node.js 22.13+。

1. 在 GitHub 点击 **Use this template**（推荐），或普通 clone。
2. 使用 `npm ci` 安装 lockfile 锁定的依赖。
3. 修改 `astro-publish-kit.config.mjs`，替换 Demo 身份信息。
4. 把 `SITE_URL` 设置为你的生产 HTTPS Origin。
5. 用 `npm run new-post -- my-first-post` 创建第一篇文章。
6. 运行 `npm run check`。
7. 将 `dist/` 部署到 Cloudflare Pages。

```bash
git clone https://github.com/oyjq0000/AstroPublishKit.git
cd AstroPublishKit
npm ci
npm run dev
```

> **生产环境必填：** 部署前必须设置 `SITE_URL`。缺失或仍为 `https://example.com` 时，`npm run build:production` 会主动失败。

`SITE_URL` 决定 Canonical、Sitemap、RSS、robots.txt、JSON-LD、llms.txt、Open Graph 与分享 URL 使用的生产 Origin。

## 功能

- Astro 7 + Markdown / MDX + 类型化 Content Collections
- 响应式浅色 / 深色界面与移动端导航
- 文章、分类、标签、归档、阅读时长和文章元数据
- Pagefind 静态搜索
- TOC、分享、返回顶部
- Callout、Accordion、YouTube MDX 组件
- Canonical、Open Graph、Twitter Cards 和 JSON-LD
- Sitemap，支持 `lastModified` 和 `noindex` 过滤
- RSS、robots.txt 和 llms.txt
- 可选 Giscus、Cloudflare Web Analytics 和 Umami，默认关闭
- 内容检查、安全检查、单元测试与模板回归检查
- GitHub Actions CI
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

几个容易误解的语义：

- `category` 是一个宽泛栏目；`tags` 是零个或多个更具体主题。
- `author` 可选。不填时继承站点作者；填写时仅覆盖当前文章作者。
- v0.1.x 中 `lang` 只是文章元数据，**不会**开启多语言路由、UI 翻译或 hreflang。
- `draft: true` 表示页面完全不生成。
- `noindex: true` 表示页面仍会生成并可直接访问，但从 Sitemap、Pagefind 和 llms.txt 的发现链路中排除，同时输出 robots `noindex`。

封面、MDX 组件和完整 Frontmatter 见 **[内容写作说明](docs/content.md)**。

### Pagefind 在开发环境中的行为

Pagefind 索引由 `npm run build` 生成。`npm run dev` 时 Search 页面本身存在，但要验证完整搜索索引，建议使用：

```bash
npm run build && npm run preview
```

## 质量门禁

| 检查 | 作用 |
| --- | --- |
| `npm run typecheck` | Astro / TypeScript 正确性 |
| `npm run test` | 工具函数回归测试 |
| `npm run check:content` | Frontmatter、内容约定与 taxonomy slug 冲突 |
| `npm run check:safety` | 常见 secret 模式与误提交的环境文件 |
| `npm run build` | 最终静态输出 + Pagefind 索引 |
| `npm run check:template` | 使用假用户身份构建并扫描生成站点中的身份残留 |
| `npm run check` | typecheck + tests + content + safety + build |

CI 使用 `npm ci` 安装依赖，先运行 `npm run check`，再运行模板回归检查。

## Cloudflare Pages — 推荐

绝大多数用户建议直接把 GitHub 仓库连接到 Cloudflare Pages：

| 配置项 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | `npm run build:production` |
| 构建输出目录 | `dist` |
| `SITE_URL` | 你的生产 HTTPS Origin |
| `NODE_VERSION` | `22.13.0` 或兼容的 Node 22 |

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
- [ ] 设置 `SITE_URL`
- [ ] 运行 `npm run check`
- [ ] 运行 `npm run check:template`
- [ ] 运行 `npm run build:production`

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
src/pages/                      静态路由与 Feed
src/styles/global.css           可替换的视觉层
astro-publish-kit.config.mjs    主要站点配置
scripts/                        写作和质量检查脚本
docs/                           内容、配置和部署文档
```

## 当前范围

v0.1.x 明确不包含 i18n 路由、Mermaid、LaTeX、Dynamic OG、Gallery、多作者系统、CMS / Admin / Database / Auth、AI 写作、广告系统或重型 Theme 配置系统。

## 来源与署名

仓库拥有独立 Git 历史，并只保留简短、长期有效的来源记录。见 `PROVENANCE.md` 与 `THIRD_PARTY_NOTICES.md`。

## 许可证

MIT。见 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。
