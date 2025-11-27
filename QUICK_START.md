# WeRoam 快速开始指南

## 🚀 5分钟快速设置

### 第一步：安装依赖

```bash
npm install
```

### 第二步：配置数据库

#### 方法 A：使用本地 PostgreSQL（推荐用于学习）

1. **安装 PostgreSQL**
   - Windows: [下载安装程序](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt install postgresql`

2. **启动 PostgreSQL 服务**
   - Windows: 在"服务"中启动 PostgreSQL
   - macOS: `brew services start postgresql@15`
   - Linux: `sudo systemctl start postgresql`

3. **创建数据库**
   ```bash
   # 进入 PostgreSQL 命令行
   psql -U postgres
   
   # 创建数据库
   CREATE DATABASE weroam;
   
   # 退出
   \q
   ```

4. **创建 .env 文件**
   ```bash
   # 复制示例文件
   cp .env.example .env
   
   # 编辑 .env 文件，修改密码为你的 PostgreSQL 密码
   # DATABASE_URL="******localhost:5432/weroam?schema=public"
   ```

#### 方法 B：使用云数据库（推荐用于演示）

**使用 Supabase（免费）**：

1. 访问 [Supabase](https://supabase.com/) 并注册
2. 创建新项目
3. 在项目设置中找到数据库连接字符串
4. 创建 .env 文件并粘贴连接字符串：
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"
   ```

### 第三步：初始化数据库

```bash
# 1. 生成 Prisma Client
npm run prisma:generate

# 2. 运行数据库迁移（创建表）
npm run prisma:migrate

# 3. 填充测试数据
npm run prisma:seed
```

**预期输出：**
```
开始填充测试数据...
⚠️  警告：这将清空现有数据
✓ 已创建 3 个测试用户
✓ 已创建 5 篇测试游记
✓ 已创建 6 条测试评论
✓ 已创建 2 条回复评论

✅ 测试数据填充完成！

📊 数据统计：
   用户: 3 个
   游记: 5 篇
   评论: 8 条

🎉 可以开始测试应用了！
```

### 第四步：验证设置

```bash
# 检查数据库连接和数据
npm run prisma:check
```

**预期看到：**
- ✅ 数据库连接成功
- ✅ 使用 PostgreSQL 数据库
- ✅ 找到 3 个数据表 (users, travel_posts, comments)
- ✅ 找到测试数据 (3个用户, 5篇游记, 8条评论)

### 第五步：启动应用

```bash
npm run dev
```

打开浏览器访问：
- 首页：http://localhost:3000
- 社区：http://localhost:3000/community
- 发布游记：http://localhost:3000/create-post

## ✅ 验证清单

- [ ] 安装了 Node.js (v18+)
- [ ] 安装了 PostgreSQL 或配置了云数据库
- [ ] 创建了 .env 文件并配置了 DATABASE_URL
- [ ] 运行了 `npm install`
- [ ] 运行了 `npm run prisma:migrate`
- [ ] 运行了 `npm run prisma:seed`
- [ ] 运行 `npm run prisma:check` 看到了测试数据
- [ ] 运行 `npm run dev` 成功启动应用

## 🎯 测试数据说明

### 3个测试用户

| 用户名 | 邮箱 | 昵称 | 位置 |
|--------|------|------|------|
| zhangsan | zhangsan@example.com | 旅行达人张三 | 北京 |
| lisi | lisi@example.com | 美食探索者李四 | 上海 |
| wangwu | wangwu@example.com | 摄影师王五 | 成都 |

### 5篇游记

1. **北京故宫三日游** - 张三 - 1,523浏览 234点赞
2. **成都美食探店** - 李四 - 2,341浏览 456点赞
3. **西藏拉萨朝圣之旅** - 王五 - 3,456浏览 678点赞
4. **杭州西湖春日漫游** - 张三 - 1,876浏览 321点赞
5. **上海迪士尼两日游** - 李四 - 2,890浏览 543点赞

每篇游记包含：
- 详细的中文内容（300-500字）
- 高质量配图（Unsplash）
- 旅行日期和位置
- 主题标签
- 真实的统计数据

### 8条评论

包含用户之间的互动、提问、回复等真实场景。

## 📊 查看数据

### 使用 Prisma Studio（推荐）

```bash
npm run prisma:studio
```

打开 http://localhost:5555 查看和编辑数据。

### 使用 psql 命令行

```bash
# 连接数据库
psql -U postgres -d weroam

# 查看用户
SELECT username, nickname, location FROM users;

# 查看游记
SELECT title, location, "viewCount", "likeCount" FROM travel_posts;

# 退出
\q
```

## ❌ 常见问题

### 问题 1：无法连接数据库

**错误信息**：`Can't reach database server`

**解决方法**：
1. 确认 PostgreSQL 服务正在运行
2. 检查 .env 文件中的密码和端口是否正确
3. 确认数据库 `weroam` 已创建

### 问题 2：没有测试数据

**症状**：运行 `npm run prisma:check` 显示数据为空

**解决方法**：
```bash
# 重新运行 seed 脚本
npm run prisma:seed
```

### 问题 3：Prisma Client 错误

**错误信息**：`Cannot find module '@prisma/client'`

**解决方法**：
```bash
# 重新生成 Prisma Client
npm run prisma:generate
```

### 问题 4：迁移失败

**错误信息**：`Migration failed`

**解决方法**：
```bash
# 重置数据库（会删除所有数据）
npx prisma migrate reset

# 重新填充数据
npm run prisma:seed
```

## 📚 更多文档

- **POSTGRESQL_SETUP.md** - PostgreSQL 详细安装和配置
- **PRISMA_SETUP.md** - Prisma 使用指南和 API 示例
- **TEST_DATA_GUIDE.md** - 测试数据详细说明
- **DATABASE_DIAGRAM.md** - 数据库架构图

## 🆘 需要帮助？

1. 检查 .env 文件是否正确配置
2. 运行 `npm run prisma:check` 诊断问题
3. 查看错误信息并参考上面的常见问题
4. 阅读详细文档获取更多信息

## 🎓 下一步

设置完成后，你可以：

1. ✅ 浏览测试数据（Prisma Studio）
2. ✅ 访问创建游记页面（/create-post）
3. ✅ 开始开发新功能
4. ✅ 实现用户认证功能
5. ✅ 开发游记列表和详情页

祝开发愉快！🎉
