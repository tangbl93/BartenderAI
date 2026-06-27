# 多 Agents 团队协作约定（Subagents）

本项目以多 Agents（Subagents）模式组建产品团队并行推进。本文件定义角色职责、协作约束与交付边界，是所有 Agent 协作的唯一参考。

## 角色与职责

| 角色 | 人数 | 主要产出目录 | 职责 |
|---|---|---|---|
| 产品 PM | 2 | `openspec/`、`docs/` | 需求拆解、维护 proposal/spec 验收口径、验收用例 |
| 交互设计 UX | 2 | `docs/`、`web/` `app/` 设计稿 | 信息架构、界面流程、海报版式规范、i18n 文案规范 |
| 前端 FE | 1 | `web/` | Vue 前台用户站 + 管理后台 |
| App | 1 | `app/` | Flutter 移动端、Android APK 交付 |
| 后端 BE | 1 | `backend/` | NestJS API、AI 编排、OpenAPI 文档、Dockerfile |
| 测试 QA | 2 | `*/test`、`infra/` | 单测/系统测试、截图基线、回归、CI |

## 协作约束（关键）

1. **契约先行**：[docs/api/openapi.yaml](api/openapi.yaml) 是前后端/App 的唯一接口事实来源。任何接口变更先改契约，再改实现。
2. **隔离工作区**：各角色只在自己的产出目录写代码（`backend/` `web/` `app/` `infra/`），避免并行冲突。
3. **i18n 规范统一**：五语种键命名遵循 [docs/i18n-conventions.md](i18n-conventions.md)，三端共享键名空间。
4. **密钥安全**：所有密钥（含 `IMAGE_API_KEY`）仅经环境变量注入，禁止写入代码、配置或日志；`.env` 不入库。
5. **测试与截图比对**：关键链路输出结构化日志；UI 回归用 Playwright（Web）与 Flutter golden（App）截图基线比对。
6. **可饮用/合规约束在后端**：配方安全过滤、酒精与未成年人提示由后端统一保证，前端只展示。

## 端到端核心链路

选材（翻冰箱）→ AI 生成配方 + 保姆级指南 → 联动 gpt-image-2 生成多维度海报矩阵 → 作品打卡 → 海报墙审核与社交裂变。

## 技术选型

- 前端 Web：Vue 3 + Vite + Pinia + Vue Router + vue-i18n + Vitest + Playwright
- App：Flutter 3 + intl/ARB + flutter_test/integration_test
- 后端：NestJS + TypeORM + Swagger(OpenAPI) + Jest
- 部署：Docker / docker-compose；App 以 Android APK 分发
