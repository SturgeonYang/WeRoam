# WeRoam 数据库架构说明

## 概述

本文档详细说明了 WeRoam（云旅札记）旅行游记社区的数据库架构设计。数据库使用 Prisma ORM 进行管理，采用 SQLite 作为开发环境数据库（生产环境可切换为 PostgreSQL 或 MySQL）。

## 数据模型

### 1. 用户表 (User)

用户表存储所有注册用户的基本信息和账户数据。

#### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | String | 主键, 自动生成 | 用户的唯一标识符，使用 CUID 格式自动生成，确保全局唯一性 |
| `email` | String | 唯一, 必填 | 用户的邮箱地址，用于登录和接收通知，必须全局唯一 |
| `username` | String | 唯一, 必填 | 用户名，用于 @提及和个人主页 URL，必须全局唯一 |
| `password` | String | 必填 | 用户密码（应使用 bcrypt 等算法加密后存储，不应存储明文） |
| `nickname` | String | 可选 | 用户昵称，用于个性化显示，如果不设置则使用 username |
| `avatar` | String | 可选 | 用户头像的 URL 地址，如果不设置可以使用默认头像 |
| `bio` | String | 可选 | 个人简介，用户可以在此介绍自己的旅行经历、兴趣爱好等 |
| `location` | String | 可选 | 用户所在地，如"北京"、"上海"、"Paris"等 |
| `createdAt` | DateTime | 自动生成 | 账号创建时间，自动设置为记录创建时的时间戳 |
| `updatedAt` | DateTime | 自动更新 | 账号信息最后更新时间，每次修改用户信息时自动更新 |

#### 关联关系

- `posts`: 一对多关系，关联到该用户发布的所有游记
- `comments`: 一对多关系，关联到该用户发表的所有评论

#### 使用示例

```typescript
// 创建新用户
const newUser = await prisma.user.create({
  data: {
    email: 'zhangsan@example.com',
    username: 'zhangsan',
    password: hashedPassword, // 已加密的密码
    nickname: '旅行达人张三',
    bio: '热爱旅行，已走过30个国家',
    location: '北京'
  }
});

// 查询用户及其游记
const userWithPosts = await prisma.user.findUnique({
  where: { email: 'zhangsan@example.com' },
  include: { posts: true }
});
```

---

### 2. 游记表 (TravelPost)

游记表存储用户发布的旅行游记内容，是社区的核心内容载体。

#### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | String | 主键, 自动生成 | 游记的唯一标识符，使用 CUID 格式自动生成 |
| `title` | String | 必填 | 游记标题，如"北京故宫三日游攻略"、"巴黎浪漫之旅" |
| `content` | String | 必填 | 游记正文内容，支持 Markdown 格式或纯文本，可以包含详细的旅行经历、攻略、感想等 |
| `images` | String | 可选 | 游记图片 URL 列表，以 JSON 数组字符串格式存储，如 `["https://example.com/img1.jpg", "https://example.com/img2.jpg"]` |
| `coverImage` | String | 可选 | 封面图片 URL，用于在游记列表、卡片中展示，提升视觉效果 |
| `location` | String | 可选 | 旅行目的地名称，如"北京"、"巴黎"、"东京"，便于分类和搜索 |
| `startDate` | DateTime | 可选 | 旅行开始日期，记录旅程起始时间 |
| `endDate` | DateTime | 可选 | 旅行结束日期，记录旅程结束时间 |
| `tags` | String | 可选 | 标签列表，以 JSON 数组字符串格式存储，如 `["美食", "风景", "历史文化"]`，用于分类和筛选 |
| `published` | Boolean | 默认 true | 发布状态，true 表示已发布（公开可见），false 表示草稿（仅作者可见） |
| `viewCount` | Int | 默认 0 | 浏览次数统计，每次有用户查看游记详情时递增 |
| `likeCount` | Int | 默认 0 | 点赞数统计，用户点赞时递增，取消点赞时递减 |
| `createdAt` | DateTime | 自动生成 | 游记创建时间，自动设置为记录创建时的时间戳 |
| `updatedAt` | DateTime | 自动更新 | 游记最后更新时间，每次修改游记内容时自动更新 |

#### 关联关系

- `author`: 多对一关系，关联到游记作者（User 表）
- `authorId`: 外键，指向作者的 ID
- `comments`: 一对多关系，关联到该游记的所有评论
- **级联删除**: 当用户被删除时，其所有游记也会被删除（`onDelete: Cascade`）

#### 索引说明

为了提高查询性能，创建了以下索引：
- `authorId`: 快速查询某个作者的所有游记
- `published`: 快速筛选已发布的游记
- `createdAt`: 支持按时间排序和分页

#### 使用示例

```typescript
// 创建新游记
const newPost = await prisma.travelPost.create({
  data: {
    title: '北京故宫三日游',
    content: '这次去北京玩了三天，主要参观了故宫、长城...',
    images: JSON.stringify([
      'https://example.com/forbidden-city-1.jpg',
      'https://example.com/forbidden-city-2.jpg'
    ]),
    coverImage: 'https://example.com/forbidden-city-cover.jpg',
    location: '北京',
    tags: JSON.stringify(['历史文化', '建筑', '攻略']),
    authorId: 'user_id_here',
    published: true
  }
});

// 查询已发布的游记，按创建时间排序
const posts = await prisma.travelPost.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  include: { 
    author: true,
    comments: true 
  }
});

// 增加浏览次数
await prisma.travelPost.update({
  where: { id: postId },
  data: { viewCount: { increment: 1 } }
});
```

---

### 3. 评论表 (Comment)

评论表存储用户对游记的评论和回复，支持多层级嵌套回复。

#### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | String | 主键, 自动生成 | 评论的唯一标识符，使用 CUID 格式自动生成 |
| `content` | String | 必填 | 评论内容文本，支持纯文本或简单的 Markdown 格式 |
| `createdAt` | DateTime | 自动生成 | 评论发表时间，自动设置为记录创建时的时间戳 |
| `updatedAt` | DateTime | 自动更新 | 评论最后修改时间，每次编辑评论时自动更新 |

#### 关联关系

- `author`: 多对一关系，关联到评论作者（User 表）
- `authorId`: 外键，指向评论作者的 ID
- `post`: 多对一关系，关联到被评论的游记（TravelPost 表）
- `postId`: 外键，指向游记的 ID
- `parent`: 多对一关系，关联到父评论（Comment 表），用于实现回复功能
- `parentId`: 外键，指向父评论的 ID，如果为 null 则表示这是一级评论
- `replies`: 一对多关系，关联到该评论的所有回复
- **级联删除**: 
  - 当用户被删除时，其所有评论也会被删除
  - 当游记被删除时，该游记的所有评论也会被删除
  - 当父评论被删除时，其所有回复也会被删除

#### 评论层级结构

评论支持嵌套回复，形成树状结构：
- **一级评论**: `parentId` 为 null 的评论，直接评论游记
- **二级评论**: `parentId` 指向一级评论，是对一级评论的回复
- **多级回复**: 可以继续嵌套，`parentId` 指向上一级评论

#### 索引说明

为了提高查询性能，创建了以下索引：
- `authorId`: 快速查询某个用户的所有评论
- `postId`: 快速查询某个游记的所有评论
- `parentId`: 快速查询某个评论的所有回复
- `createdAt`: 支持按时间排序

#### 使用示例

```typescript
// 创建一级评论（直接评论游记）
const comment = await prisma.comment.create({
  data: {
    content: '写得真好！我也去过北京，故宫确实很震撼！',
    authorId: 'user_id_here',
    postId: 'post_id_here',
    parentId: null // 一级评论，无父评论
  }
});

// 创建二级评论（回复一级评论）
const reply = await prisma.comment.create({
  data: {
    content: '同意！故宫的建筑艺术真的令人惊叹',
    authorId: 'another_user_id',
    postId: 'post_id_here',
    parentId: comment.id // 回复上面的评论
  }
});

// 查询游记的所有一级评论及其回复
const commentsWithReplies = await prisma.comment.findMany({
  where: { 
    postId: postId,
    parentId: null // 只查询一级评论
  },
  include: {
    author: true,
    replies: {
      include: {
        author: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## 数据库操作

### 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev --name init

# 打开 Prisma Studio 可视化管理数据库
npx prisma studio
```

### 在代码中使用

```typescript
// lib/prisma.ts - 创建 Prisma Client 单例
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 数据类型说明

### JSON 字段存储格式

某些字段使用 JSON 字符串存储数组数据：

#### images 字段示例
```json
["https://example.com/img1.jpg", "https://example.com/img2.jpg", "https://example.com/img3.jpg"]
```

使用时需要序列化和反序列化：
```typescript
// 存储时
const imagesJson = JSON.stringify(imageUrls);

// 读取时
const imageUrls = JSON.parse(post.images || '[]');
```

#### tags 字段示例
```json
["美食", "风景", "历史文化", "摄影"]
```

---

## 安全性考虑

### 密码存储

**重要**: 永远不要存储明文密码！

推荐使用 bcrypt 加密：

```typescript
import bcrypt from 'bcrypt';

// 注册时加密密码
const hashedPassword = await bcrypt.hash(password, 10);
await prisma.user.create({
  data: {
    email,
    username,
    password: hashedPassword // 存储加密后的密码
  }
});

// 登录时验证密码
const user = await prisma.user.findUnique({ where: { email } });
const isValid = await bcrypt.compare(password, user.password);
```

### 数据验证

在创建或更新数据前，应该进行验证：

```typescript
// 验证邮箱格式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('邮箱格式不正确');
}

// 验证用户名（只允许字母、数字、下划线）
const usernameRegex = /^[a-zA-Z0-9_]+$/;
if (!usernameRegex.test(username)) {
  throw new Error('用户名只能包含字母、数字和下划线');
}
```

---

## 扩展功能建议

未来可以考虑添加以下功能：

### 1. 点赞功能
创建 `Like` 表记录用户的点赞行为：
```prisma
model Like {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      TravelPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId]) // 确保一个用户对同一个游记只能点赞一次
}
```

### 2. 收藏功能
创建 `Bookmark` 表记录用户的收藏：
```prisma
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      TravelPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
}
```

### 3. 关注功能
创建 `Follow` 表实现用户互相关注：
```prisma
model Follow {
  id          String   @id @default(cuid())
  followerId  String   // 关注者
  followingId String   // 被关注者
  createdAt   DateTime @default(now())
  
  follower    User @relation("Followers", fields: [followerId], references: [id], onDelete: Cascade)
  following   User @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
}
```

### 4. 标签独立表
将标签从 JSON 字符串改为独立的表，便于标签管理和统计：
```prisma
model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts TravelPost[]
}
```

---

## 性能优化建议

1. **使用分页**: 查询游记列表时使用 `skip` 和 `take` 进行分页
2. **选择性加载**: 使用 `select` 只获取需要的字段，避免加载所有数据
3. **批量操作**: 使用 `createMany`、`updateMany` 进行批量操作
4. **数据库索引**: schema 中已经为常用查询字段添加了索引
5. **缓存**: 对热门内容可以使用 Redis 等缓存技术

---

## 总结

这个数据库架构为 WeRoam 旅行游记社区提供了完整的基础：

- **用户系统**: 完善的用户信息管理
- **内容管理**: 支持富文本、图片的游记发布
- **社交互动**: 评论和回复功能
- **可扩展性**: 易于添加点赞、收藏、关注等功能

通过 Prisma ORM，我们可以用类型安全的方式操作数据库，提高开发效率和代码质量。
