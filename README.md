# WeRoam - 旅行游记社区

[Switch to English / 切换到英文版](#weroam---travel-journal-community)

WeRoam 是一个使用 Next.js 全栈框架构建的现代化旅行游记分享平台。用户可以在这里记录旅行点滴、发现热门目的地，并与其他旅行爱好者互动。

## 🛠️ 技术栈

- **核心框架**: [Next.js 14+](https://nextjs.org/) (React, App Router)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) (关系型数据库)
- **ORM & 数据管理**: [Prisma](https://www.prisma.io/)
- **UI 样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **地图集成**: [Leaflet](https://leafletjs.com/) (OpenStreetMap)
- **部署环境**: 支持 Vercel, 本地, Linux (Ubuntu)

## 🚀 主要功能

- **用户鉴权**: 完整的注册、登录流程。
- **内容发布**: 支持富文本游记撰写，包含图片上传、日期选择和地点标记。
- **社区互动**: 评论、回复、点赞系统。
- **个性化**: 用户个人资料管理（头像、简介）。
- **探索发现**: 基于标签的筛选和内容推荐。

---

## 🏁 快速开始 (Quick Start)

### 1. 安装项目

确保已安装 Node.js (v18+) 和 PostgreSQL (v16+)。

```bash
# 安装依赖
npm install
```

### 2. 环境配置

```bash
# 复制配置文件
cp .env.example .env
```

修改 `.env` 文件中的数据库连接字符串：
```env
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/weroam?schema=public"
```

### 3. 数据初始化

```bash
# 生成 Prisma Client
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 注入测试数据 (包含3个用户和5篇精选游记)
npm run prisma:seed
```

### 4. 启动开发服务

```bash
npm run dev
```
访问 http://localhost:3000

---

## 📚 项目结构与数据库

### 核心目录
- `src/app`: Next.js App Router 页面结构。
- `src/components`: 可复用的 React 组件。
- `src/lib`: Prisma 实例与其他工具函数。
- `prisma/`: 数据库 Schema 定义、迁移记录和 Seed 脚本。

### 数据库模型 (Prisma Schema)
- **User**: 账户信息、个人资料。
- **TravelPost**: 游记核心内容、关联的 User。
- **Comment**: 评论内容、支持无限级嵌套回复。

---

## 🌍 部署说明

- **Vercel**: 推荐。连接 GitHub 仓库即可自动部署（需配置云端 Postgres）。
- **Linux (Ubuntu) / aaPanel**:
  1. 准备 Node.js 18+ 和 PostgreSQL 环境。
  2. `git clone` 代码并安装依赖。
  3. 配置 `.env.production`。
  4. 运行 `npx prisma migrate deploy`。
  5. 使用 PM2 启动 (`pm2 start npm --name "weroam" -- start`) 并配置 Nginx 反代。

---

## 🔧 常见问题

- **数据库连接失败**：检查 `.env` 中的账号密码及端口（默认 5432）。
- **`npm not found` (aaPanel)**：请在 Node 版本管理器中将 Node 设置为默认版本，或建立软链接。
- **Prisma Client 报错**：修改 `schema.prisma` 后务必运行 `npm run prisma:generate`。

---
---

# WeRoam - Travel Journal Community

WeRoam is a modern travel journal sharing platform built with the Next.js full-stack framework. It allows users to document their travels, discover new destinations, and interact with a community of travelers.

## 🛠️ Tech Stack

Built with modern web development best practices:

- **Core Framework**: [Next.js 14+](https://nextjs.org/) (React, App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Relational DB)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) (OpenStreetMap)
- **Deployment**: Supports Vercel, Local, Linux (Ubuntu), and aaPanel.

## 🚀 Key Features

- **Authentication**: Complete registration and login flow.
- **Content Creation**: Rich text travel logging with images, dates, and location tagging.
- **Community**: Comments, nested replies, and like system.
- **Personalization**: User profile management (Avatar, Bio).
- **Discovery**: Tag-based filtering and content recommendation.

---

## 🏁 Quick Start

### 1. Installation

Ensure Node.js (v18+) and PostgreSQL (v16+) are installed.

```bash
# Install dependencies
npm install
```

### 2. Configuration

```bash
# Copy env file
cp .env.example .env
```

Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/weroam?schema=public"
```

### 3. Initialization

```bash
# Generate Prisma Client
npm run prisma:generate

# Run Migrations
npm run prisma:migrate

# Seed Database (includes 3 users & 5 posts)
npm run prisma:seed
```

### 4. Development

```bash
npm run dev
```
Visit http://localhost:3000

---

## 📚 Structure & Database

### Core Directories
- `src/app`: Next.js App Router structure.
- `src/components`: Reusable React components.
- `src/lib`: Prisma instance and utilities.
- `prisma/`: Database schema, migrations, and seed scripts.

### Database Models
- **User**: Account info and profile.
- **TravelPost**: Travel logs linked to Users.
- **Comment**: Comments with nested reply support.

---

## 🌍 Deployment

- **Vercel**: Recommended. Connect GitHub repo for auto-deploy (requires cloud Postgres).
- **Linux (Ubuntu) / aaPanel**:
  1. Setup Node.js 18+ and PostgreSQL.
  2. Clone repo and install dependencies.
  3. Configure `.env.production`.
  4. Run `npx prisma migrate deploy`.
  5. Start with PM2 (`pm2 start npm --name "weroam" -- start`) and setup Nginx reverse proxy.

---

## 🔧 Troubleshooting

- **Database Errors**: Verify credentials and port (default 5432) in `.env`.
- **`npm not found` (aaPanel)**: Set Node as default in version manager or create symlinks.
- **Prisma Client Issues**: Always run `npm run prisma:generate` after changing `schema.prisma`.
