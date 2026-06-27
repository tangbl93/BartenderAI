# Home Bartender AI（居家 AI 调酒师）

智能"翻冰箱"盲盒调酒 → AI 配方 + 保姆级指南 → 多维度商业级海报矩阵 → 作品打卡 → 海报墙社交裂变。

## 仓库结构

```
backend/   NestJS 后端：REST API、AI 编排、OpenAPI 文档、Dockerfile
web/       Vue 3 前端：前台用户站 + 管理后台
app/       Flutter 移动端（Android APK 交付）
infra/     docker-compose、部署脚本
docs/      协作约定、API 契约、i18n 规范
  api/openapi.yaml      ← 前后端/App 唯一接口契约
openspec/  规格驱动的变更（proposal / specs / design / tasks）
```

## 技术选型

- 前端 Web：Vue 3 + Vite + Pinia + Vue Router + vue-i18n
- App：Flutter 3 + intl/ARB
- 后端：NestJS + TypeORM + Swagger(OpenAPI) + Jest
- 部署：Docker / docker-compose；App 以 Android APK 分发

## 快速开始

```bash
cp .env.example .env            # 填入本地配置（密钥勿提交）
docker compose up -d            # 起后端 + 前端 + postgres + minio
# 或分别本地启动：
cd backend && npm install && npm run start:dev      # http://localhost:3000/api/v1  (文档 /docs)
cd web && npm install && npm run dev                # http://localhost:5173
cd app && flutter pub get && flutter run            # 移动端
```

## 多 Agents 协作

团队角色与协作约束见 [docs/agents-collaboration.md](docs/agents-collaboration.md)。
契约先行：任何接口改动先改 [docs/api/openapi.yaml](docs/api/openapi.yaml)。

## 国际化

支持 en / zh-CN / zh-TW / ja / ko，规范见 [docs/i18n-conventions.md](docs/i18n-conventions.md)。

## 安全

所有密钥（含图像模型 `IMAGE_API_KEY`）仅经 `.env` 环境变量注入，**禁止入库**。
