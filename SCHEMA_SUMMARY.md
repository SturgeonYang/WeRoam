# Prisma Schema 完成总结

## 项目概述

已成功为 WeRoam（云旅札记）旅行游记社区创建完整的 Prisma 数据库架构。

## 创建的文件

### 核心文件
1. **prisma/schema.prisma** - Prisma 数据库架构定义文件
2. **prisma.config.ts** - Prisma 配置文件（Prisma 7 新格式）
3. **src/lib/prisma.ts** - Prisma Client 初始化文件

### 数据库迁移
4. **prisma/migrations/20251124103927_init/** - 初始数据库迁移
   - migration.sql - 包含所有表的创建语句

### 文档
5. **prisma/README.md** - 详细的数据模型说明文档（8.6KB）
6. **PRISMA_SETUP.md** - 完整的使用指南（9.1KB）
7. **本文件** - 总结文档

### 配置文件更新
8. **package.json** - 添加了 Prisma 相关的 npm scripts
9. **.gitignore** - 排除数据库文件和生成的代码
10. **.env** - 数据库连接配置

## 数据库架构

### 表 1: User（用户表）

存储所有注册用户的基本信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 用户唯一标识符（CUID） |
| email | String | 邮箱地址（唯一，用于登录） |
| username | String | 用户名（唯一） |
| password | String | 加密后的密码 |
| nickname | String? | 昵称（可选） |
| avatar | String? | 头像 URL（可选） |
| bio | String? | 个人简介（可选） |
| location | String? | 所在地（可选） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**关联关系：**
- 一对多：User → TravelPost（一个用户可以发布多篇游记）
- 一对多：User → Comment（一个用户可以发表多条评论）

### 表 2: TravelPost（游记表）

存储用户发布的旅行游记内容。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 游记唯一标识符（CUID） |
| title | String | 游记标题 |
| content | String | 游记正文内容 |
| images | String? | 图片 URL 列表（JSON 数组字符串） |
| coverImage | String? | 封面图片 URL |
| location | String? | 旅行目的地 |
| startDate | DateTime? | 旅行开始日期 |
| endDate | DateTime? | 旅行结束日期 |
| tags | String? | 标签（JSON 数组字符串） |
| published | Boolean | 是否已发布（默认 true） |
| viewCount | Int | 浏览次数（默认 0） |
| likeCount | Int | 点赞数（默认 0） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| authorId | String | 作者 ID（外键） |

**关联关系：**
- 多对一：TravelPost → User（多篇游记属于一个作者）
- 一对多：TravelPost → Comment（一篇游记可以有多条评论）

**索引：**
- authorId - 快速查询某作者的所有游记
- published - 快速筛选已发布的游记
- createdAt - 支持按时间排序

### 表 3: Comment（评论表）

存储用户对游记的评论和回复。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 评论唯一标识符（CUID） |
| content | String | 评论内容 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| authorId | String | 评论作者 ID（外键） |
| postId | String | 所属游记 ID（外键） |
| parentId | String? | 父评论 ID（可选，用于回复） |

**关联关系：**
- 多对一：Comment → User（多条评论属于一个用户）
- 多对一：Comment → TravelPost（多条评论属于一篇游记）
- 多对一：Comment → Comment（多条回复属于一条评论）
- 一对多：Comment → Comment（一条评论可以有多条回复）

**索引：**
- authorId - 快速查询某用户的所有评论
- postId - 快速查询某游记的所有评论
- parentId - 快速查询某评论的所有回复
- createdAt - 支持按时间排序

**评论层级：**
- parentId 为 null：一级评论（直接评论游记）
- parentId 有值：回复（回复其他评论）

## 字段解释汇总

### 用户相关字段
- **email**: 用于用户登录和身份验证，必须全局唯一
- **username**: 用于 @提及和个人主页 URL，必须全局唯一
- **password**: 应使用 bcrypt 等算法加密后存储，永远不要存储明文
- **nickname**: 用户昵称，用于个性化显示
- **avatar**: 头像图片的 URL 地址
- **bio**: 个人简介，介绍旅行经历、兴趣等
- **location**: 用户所在地，如"北京"、"上海"

### 游记相关字段
- **title**: 游记标题，如"北京故宫三日游"
- **content**: 游记正文，支持 Markdown 或纯文本
- **images**: 图片 URL 列表，以 JSON 数组字符串存储，如 `["url1", "url2"]`
- **coverImage**: 封面图，用于列表展示
- **location**: 旅行目的地，如"北京"、"巴黎"
- **startDate**: 旅行开始日期
- **endDate**: 旅行结束日期
- **tags**: 标签列表，以 JSON 数组字符串存储，如 `["美食", "风景"]`
- **published**: 发布状态，true=已发布，false=草稿
- **viewCount**: 浏览次数统计
- **likeCount**: 点赞数统计

### 评论相关字段
- **content**: 评论内容文本
- **parentId**: 父评论 ID，null 表示一级评论，有值表示这是回复

### 时间戳字段
- **createdAt**: 记录创建时间，自动设置为当前时间
- **updatedAt**: 记录最后更新时间，自动更新

## 快速开始

### 1. 生成 Prisma Client
```bash
npm run prisma:generate
```

### 2. 运行数据库迁移
```bash
npm run prisma:migrate
```

### 3. 打开 Prisma Studio（可视化管理）
```bash
npm run prisma:studio
```

### 4. 在代码中使用
```typescript
import { prisma } from '@/lib/prisma';

// 创建用户
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'username',
    password: hashedPassword,
  }
});

// 查询游记
const posts = await prisma.travelPost.findMany({
  where: { published: true },
  include: { author: true, comments: true }
});
```

## 可用的 npm 命令

| 命令 | 说明 |
|------|------|
| `npm run prisma:generate` | 生成 Prisma Client |
| `npm run prisma:migrate` | 创建数据库迁移 |
| `npm run prisma:studio` | 打开可视化管理界面 |
| `npm run build` | 构建项目（自动生成 Prisma Client） |

## 重要特性

### 1. 类型安全
- 完整的 TypeScript 类型支持
- 自动生成的类型定义
- 编译时类型检查

### 2. 数据关系
- 用户和游记：一对多
- 用户和评论：一对多
- 游记和评论：一对多
- 评论和回复：自引用一对多

### 3. 级联删除
- 删除用户时，自动删除其所有游记和评论
- 删除游记时，自动删除该游记的所有评论
- 删除评论时，自动删除该评论的所有回复

### 4. 索引优化
- 为常用查询字段添加了索引
- 提高查询性能
- 支持快速排序和筛选

### 5. JSON 字段
- images 字段存储多张图片 URL
- tags 字段存储多个标签
- 灵活的数据结构

## 数据库配置

当前使用 SQLite 作为开发数据库：
```
DATABASE_URL="file:./dev.db"
```

生产环境可切换为 PostgreSQL：
```
DATABASE_URL="postgresql://user:password@localhost:5432/weroam?schema=public"
```

切换数据库时需要修改：
1. `.env` 文件中的 `DATABASE_URL`
2. `prisma/schema.prisma` 中的 `datasource db` provider

## 安全建议

1. ✅ 永远不要提交 `.env` 文件（已添加到 .gitignore）
2. ✅ 使用 bcrypt 加密存储密码
3. ✅ 验证用户输入
4. ✅ 使用 HTTPS 传输敏感数据
5. ✅ 限制 API 速率防止暴力破解

## 文档资源

- **prisma/README.md** - 详细的字段说明和使用示例
- **PRISMA_SETUP.md** - 完整的使用指南和最佳实践
- **Schema 文件注释** - 每个字段都有详细的中文解释

## 下一步建议

### 必需的功能
1. 实现用户认证 API（注册、登录）
2. 实现游记 CRUD API
3. 实现评论功能 API
4. 添加图片上传功能

### 可选的扩展功能
1. 点赞功能（创建 Like 表）
2. 收藏功能（创建 Bookmark 表）
3. 关注功能（创建 Follow 表）
4. 标签独立管理（创建 Tag 表）
5. 搜索功能
6. 推荐算法

## 技术栈

- **ORM**: Prisma 7.0.0
- **数据库**: SQLite（开发） / PostgreSQL（生产推荐）
- **类型系统**: TypeScript
- **框架**: Next.js 15.5.4

## 总结

✅ 完整的数据库架构设计
✅ 详细的中文文档和注释
✅ 类型安全和最佳实践
✅ 清晰的关系模型
✅ 性能优化（索引）
✅ 安全性考虑（级联删除、密码加密）
✅ 易于扩展

数据库架构已经准备就绪，可以开始实现业务逻辑了！
