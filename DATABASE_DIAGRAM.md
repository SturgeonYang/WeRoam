# WeRoam 数据库关系图

## 数据库 ER 图（实体关系图）

```
┌─────────────────────────────────┐
│          User (用户表)           │
├─────────────────────────────────┤
│ • id: String (PK)               │
│ • email: String (UNIQUE)        │
│ • username: String (UNIQUE)     │
│ • password: String              │
│ • nickname: String?             │
│ • avatar: String?               │
│ • bio: String?                  │
│ • location: String?             │
│ • createdAt: DateTime           │
│ • updatedAt: DateTime           │
└─────────────────────────────────┘
         │                   │
         │ 1                 │ 1
         │                   │
         │ *                 │ *
         ▼                   ▼
┌───────────────────────────────┐    ┌──────────────────────────┐
│   TravelPost (游记表)         │    │   Comment (评论表)        │
├───────────────────────────────┤    ├──────────────────────────┤
│ • id: String (PK)             │    │ • id: String (PK)        │
│ • title: String               │    │ • content: String        │
│ • content: String             │    │ • createdAt: DateTime    │
│ • images: String? (JSON)      │    │ • updatedAt: DateTime    │
│ • coverImage: String?         │    │ • authorId: String (FK)  │───┐
│ • location: String?           │    │ • postId: String (FK)    │   │
│ • startDate: DateTime?        │    │ • parentId: String? (FK) │   │
│ • endDate: DateTime?          │    └──────────────────────────┘   │
│ • tags: String? (JSON)        │              │          ▲         │
│ • published: Boolean          │              │ 1        │ *       │
│ • viewCount: Int              │              │          │         │
│ • likeCount: Int              │              │ *        │ 1       │
│ • createdAt: DateTime         │              ▼          │         │
│ • updatedAt: DateTime         │         ┌────────────────────┐   │
│ • authorId: String (FK)       │─────────│  (自引用 - 回复)    │   │
└───────────────────────────────┘         └────────────────────┘   │
                                                                    │
                                          (指向 User.id)  ◄─────────┘

图例：
─────  一对多关系
• PK   主键 (Primary Key)
• FK   外键 (Foreign Key)
• ?    可选字段 (Nullable)
1      一
*      多
```

## 关系说明

### 1. User ↔ TravelPost (一对多)
- **关系**: 一个用户可以发布多篇游记
- **外键**: `TravelPost.authorId` → `User.id`
- **级联删除**: 删除用户时，其所有游记也会被删除

### 2. User ↔ Comment (一对多)
- **关系**: 一个用户可以发表多条评论
- **外键**: `Comment.authorId` → `User.id`
- **级联删除**: 删除用户时，其所有评论也会被删除

### 3. TravelPost ↔ Comment (一对多)
- **关系**: 一篇游记可以有多条评论
- **外键**: `Comment.postId` → `TravelPost.id`
- **级联删除**: 删除游记时，该游记的所有评论也会被删除

### 4. Comment ↔ Comment (自引用一对多)
- **关系**: 一条评论可以有多条回复
- **外键**: `Comment.parentId` → `Comment.id`
- **级联删除**: 删除评论时，该评论的所有回复也会被删除
- **说明**: 
  - `parentId = null`: 一级评论（直接评论游记）
  - `parentId != null`: 回复评论

## 数据流向图

```
注册/登录
    │
    ▼
┌─────────┐
│  User   │
└─────────┘
    │
    ├─────► 发布游记 ─────► ┌──────────────┐
    │                      │  TravelPost  │
    │                      └──────────────┘
    │                            │
    │                            │
    └─────► 发表评论 ─────────────┼─────► ┌──────────┐
                                 │       │ Comment  │
                                 │       └──────────┘
                                 │            │
                                 │            │
                                 └────────────┘
                                   (回复评论)
```

## 查询示例

### 获取用户的所有游记
```typescript
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: { 
    posts: {
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

### 获取游记及其作者和评论
```typescript
const post = await prisma.travelPost.findUnique({
  where: { id: postId },
  include: {
    author: true,
    comments: {
      where: { parentId: null }, // 只获取一级评论
      include: {
        author: true,
        replies: { // 包含回复
          include: { author: true }
        }
      }
    }
  }
});
```

### 获取用户的所有评论
```typescript
const userComments = await prisma.comment.findMany({
  where: { authorId: userId },
  include: {
    post: true, // 包含被评论的游记
    author: true
  },
  orderBy: { createdAt: 'desc' }
});
```

## 索引优化

为了提高查询性能，以下字段已添加索引：

### TravelPost 表
- `authorId` - 快速查询某作者的游记
- `published` - 快速筛选已发布/草稿
- `createdAt` - 按时间排序

### Comment 表
- `authorId` - 快速查询某用户的评论
- `postId` - 快速查询某游记的评论
- `parentId` - 快速查询某评论的回复
- `createdAt` - 按时间排序

### User 表
- `email` - 登录查询（自动唯一索引）
- `username` - 用户名查询（自动唯一索引）

## 数据完整性

### 外键约束
所有外键关系都配置了 `onDelete: Cascade`，确保数据一致性：

1. **删除用户** → 自动删除其游记和评论
2. **删除游记** → 自动删除该游记的所有评论
3. **删除评论** → 自动删除该评论的所有回复

### 唯一性约束
- `User.email` - 必须全局唯一
- `User.username` - 必须全局唯一

### 必填字段
- User: email, username, password
- TravelPost: title, content, authorId
- Comment: content, authorId, postId

## 字段类型说明

| Prisma 类型 | SQL 类型 | 说明 |
|------------|----------|------|
| String | TEXT | 文本字符串 |
| Int | INTEGER | 整数 |
| Boolean | BOOLEAN | 布尔值 |
| DateTime | TIMESTAMP | 日期时间 |
| String? | TEXT NULL | 可选文本 |

## JSON 字段格式

某些字段使用 JSON 字符串存储复杂数据：

### images 字段
```json
["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
```

### tags 字段
```json
["美食", "风景", "历史文化", "摄影"]
```

### 使用示例
```typescript
// 存储时序列化
const post = await prisma.travelPost.create({
  data: {
    images: JSON.stringify(imageUrls),
    tags: JSON.stringify(tagList)
  }
});

// 读取时反序列化
const images = JSON.parse(post.images || '[]');
const tags = JSON.parse(post.tags || '[]');
```

## 扩展建议

未来可以添加的功能：

### 1. 点赞功能
```prisma
model Like {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user User       @relation(fields: [userId], references: [id])
  post TravelPost @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

### 2. 收藏功能
```prisma
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user User       @relation(fields: [userId], references: [id])
  post TravelPost @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

### 3. 关注功能
```prisma
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  follower  User @relation("Followers", fields: [followerId], references: [id])
  following User @relation("Following", fields: [followingId], references: [id])
  
  @@unique([followerId, followingId])
}
```

## 总结

这个数据库架构提供了：
- ✅ 清晰的数据关系
- ✅ 完整的数据完整性保护
- ✅ 优化的查询性能
- ✅ 灵活的扩展能力
- ✅ 类型安全的操作

所有表都支持级联删除，确保数据一致性和完整性。
