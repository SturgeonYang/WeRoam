# WeRoam Prisma 数据库架构使用指南

## 简介

本项目使用 Prisma ORM 作为数据库管理工具，为 WeRoam（云旅札记）旅行游记社区提供完整的数据库解决方案。

## 数据库架构概览

我们的数据库包含三个核心表：

1. **用户表 (User)** - 存储用户账户和个人信息
2. **游记表 (TravelPost)** - 存储旅行游记内容
3. **评论表 (Comment)** - 存储用户评论和回复

详细的字段说明和使用示例请参考 `prisma/README.md` 文件。

## 快速开始

### 1. 安装依赖

项目已经包含了所需的 Prisma 依赖：

```bash
npm install
```

### 2. 配置数据库

数据库连接配置在 `prisma.config.ts` 文件中：

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

数据库 URL 在 `.env` 文件中配置：

```env
# 使用 PostgreSQL（推荐）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weroam?schema=public"

# 参数说明：
# - postgres:postgres -> 用户名:密码
# - localhost:5432 -> 主机:端口
# - weroam -> 数据库名称
```

**注意**：请确保已安装并启动 PostgreSQL 数据库服务。

**安全提示**：
- 不要在代码中硬编码数据库密码
- .env 文件已添加到 .gitignore，不会被提交
- 生产环境请使用强密码并定期更换

### 3. 生成 Prisma Client

```bash
npm run prisma:generate
# 或者
npx prisma generate
```

这将在 `node_modules/@prisma/client` 目录下生成 Prisma Client 代码。

### 4. 创建数据库

```bash
npm run prisma:migrate
# 或者
npx prisma migrate dev --name init
```

这会根据 schema.prisma 文件创建数据库表结构。

### 5. 填充测试数据

我们提供了丰富的测试数据，包括用户、游记和评论：

```bash
npm run prisma:seed
# 或者
npx prisma db seed
```

这将创建：
- 3 个测试用户（张三、李四、王五）
- 5 篇精心编写的游记（北京故宫、成都美食、西藏拉萨、杭州西湖、上海迪士尼）
- 多条评论和回复

所有数据都是中文内容，非常适合测试和演示。

### 6. 使用 Prisma Studio（可选）

Prisma Studio 是一个可视化的数据库管理工具：

```bash
npm run prisma:studio
# 或者
npx prisma studio
```

浏览器会自动打开 http://localhost:5555，你可以在这里查看和编辑数据。

## 在代码中使用

### 导入 Prisma Client

在你的 Next.js API 路由或 Server Components 中：

```typescript
import { prisma } from '@/lib/prisma';
```

### 示例：创建用户

```typescript
// app/api/users/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, username, password, nickname } = await request.json();
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        nickname,
      },
    });
    
    // 返回结果（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}
```

### 示例：创建游记

```typescript
// app/api/posts/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, content, images, coverImage, location, tags, authorId } = 
      await request.json();
    
    const post = await prisma.travelPost.create({
      data: {
        title,
        content,
        images: JSON.stringify(images), // 将数组转为 JSON 字符串
        coverImage,
        location,
        tags: JSON.stringify(tags),
        authorId,
      },
      include: {
        author: true, // 包含作者信息
      },
    });
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: '创建游记失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const posts = await prisma.travelPost.findMany({
      where: {
        published: true, // 只查询已发布的游记
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true, // 统计评论数
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 按创建时间倒序
      },
      skip,
      take: limit,
    });
    
    // 解析 JSON 字段
    const postsWithParsedData = posts.map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
      tags: post.tags ? JSON.parse(post.tags) : [],
    }));
    
    return NextResponse.json(postsWithParsedData);
  } catch (error) {
    return NextResponse.json(
      { error: '获取游记列表失败' },
      { status: 500 }
    );
  }
}
```

### 示例：添加评论

```typescript
// app/api/comments/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content, authorId, postId, parentId } = await request.json();
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
        parentId: parentId || null, // 如果没有 parentId 则是一级评论
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    );
  }
}

// 获取某个游记的评论
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { error: '缺少 postId 参数' },
        { status: 400 }
      );
    }
    
    // 获取一级评论及其回复
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // 只获取一级评论
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // 回复按时间正序
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 一级评论按时间倒序
      },
    });
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}
```

## 常用命令

### 开发过程中

```bash
# 生成 Prisma Client（修改 schema 后必须执行）
npm run prisma:generate

# 创建新的数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio 可视化管理数据库
npm run prisma:studio

# 查看 Prisma 版本
npx prisma --version

# 验证 schema 是否正确
npx prisma validate

# 格式化 schema 文件
npx prisma format
```

### 数据库重置（危险操作！会删除所有数据）

```bash
# 重置数据库并重新应用所有迁移
npx prisma migrate reset

# 删除数据库文件并重新创建
rm prisma/dev.db
npm run prisma:migrate
```

## 数据库迁移管理

当你修改了 `schema.prisma` 文件后，需要创建迁移：

```bash
npx prisma migrate dev --name 描述你的修改
```

例如：
```bash
npx prisma migrate dev --name add_user_bio_field
npx prisma migrate dev --name add_post_tags
```

迁移文件会保存在 `prisma/migrations/` 目录下。

## 类型安全

Prisma 提供完整的 TypeScript 类型支持：

```typescript
import { User, TravelPost, Comment } from '@prisma/client';

// User 类型包含所有字段
const user: User = {
  id: 'cuid123',
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
  nickname: '昵称',
  avatar: 'https://example.com/avatar.jpg',
  bio: '个人简介',
  location: '北京',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 使用 Prisma 的类型工具
import { Prisma } from '@prisma/client';

// 创建类型
type CreateUserInput = Prisma.UserCreateInput;

// 查询返回类型（包含关联数据）
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;
```

## 性能优化建议

### 1. 使用 select 选择需要的字段

```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    avatar: true,
    // 不查询密码等敏感或不需要的字段
  },
});
```

### 2. 使用分页避免一次性加载大量数据

```typescript
const posts = await prisma.travelPost.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
```

### 3. 使用索引优化查询

我们的 schema 已经为常用查询字段添加了索引（见 `@@index`）。

### 4. 批量操作

```typescript
// 批量创建（更高效）
await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', username: 'user1', password: 'hash1' },
    { email: 'user2@example.com', username: 'user2', password: 'hash2' },
  ],
});
```

## 常见问题

### Q: 修改了 schema 后，TypeScript 报错找不到类型？
A: 运行 `npm run prisma:generate` 重新生成 Prisma Client。

### Q: 如何切换到 PostgreSQL？
A: 
1. 修改 `.env` 文件中的 `DATABASE_URL`
2. 修改 `prisma/schema.prisma` 中的 `datasource db` provider 为 `postgresql`
3. 运行 `npx prisma migrate dev`

### Q: 如何备份数据库？
A: 对于 SQLite：`cp prisma/dev.db prisma/dev.db.backup`
   对于 PostgreSQL：使用 `pg_dump` 命令

### Q: Prisma Studio 无法启动？
A: 检查端口 5555 是否被占用，或使用 `npx prisma studio --port 5556` 指定其他端口。

### Q: 数据库是空的，没有测试数据？
A: 请按以下步骤检查：
1. 确认 PostgreSQL 正在使用（运行 `npm run prisma:check`）
2. 确认已运行迁移（`npm run prisma:migrate`）
3. 运行 seed 脚本填充数据（`npm run prisma:seed`）
4. 使用 Prisma Studio 验证数据（`npm run prisma:studio`）

如果仍然为空，可能的原因：
- .env 文件配置错误
- 数据库连接失败
- seed 脚本执行出错（查看错误信息）

### Q: 如何验证使用的是 PostgreSQL 而不是 SQLite？
A: 运行以下命令：
```bash
# 方法 1：使用检查脚本（推荐）
npm run prisma:check

# 方法 2：查看 schema.prisma
grep "provider" prisma/schema.prisma
# 应该看到: provider = "postgresql"

# 方法 3：检查数据库
psql -U postgres -d weroam -c "SELECT version();"
```

## 安全注意事项

1. **永远不要提交 `.env` 文件到 Git**（已添加到 .gitignore）
2. **永远不要存储明文密码**，使用 bcrypt 等库加密
3. **验证用户输入**，防止 SQL 注入（Prisma 自动防护）
4. **使用 HTTPS** 传输敏感数据
5. **限制 API 速率**，防止暴力破解
6. **使用环境变量**存储敏感配置

## 更多资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Client API 参考](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js + Prisma 最佳实践](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Prisma Schema 参考](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## 技术支持

如有问题，请参考：
1. `prisma/README.md` - 详细的数据模型说明
2. Prisma 官方文档
3. 项目 GitHub Issues
