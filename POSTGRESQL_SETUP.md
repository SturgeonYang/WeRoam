# PostgreSQL 数据库设置指南

## 为什么选择 PostgreSQL？

PostgreSQL 是一个功能强大的开源关系型数据库，相比 SQLite 有以下优势：

- ✅ 更好的并发处理能力
- ✅ 支持更多高级功能（JSON、全文搜索等）
- ✅ 更适合生产环境
- ✅ 更好的数据完整性保证
- ✅ 支持更大的数据量

## 安装 PostgreSQL

### Windows

1. 下载 PostgreSQL 安装程序
   - 访问 [PostgreSQL 官网](https://www.postgresql.org/download/windows/)
   - 下载最新版本的安装程序

2. 运行安装程序
   - 设置密码（记住这个密码，后面会用到）
   - 端口使用默认的 5432
   - 安装完成后记得勾选 "Launch Stack Builder"

3. 验证安装
   ```cmd
   psql --version
   ```

### macOS

使用 Homebrew 安装：

```bash
# 安装 PostgreSQL
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 验证安装
psql --version
```

或者下载 [Postgres.app](https://postgresapp.com/)（推荐初学者使用）

### Linux (Ubuntu/Debian)

```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证安装
psql --version
```

## 创建数据库

### 方法 1：使用命令行

```bash
# 进入 PostgreSQL 命令行（Windows 用户使用 psql -U postgres）
psql -U postgres

# 创建数据库
CREATE DATABASE weroam;

# 查看数据库列表
\l

# 退出
\q
```

### 方法 2：使用 pgAdmin（图形界面）

1. 打开 pgAdmin（安装 PostgreSQL 时会自动安装）
2. 连接到本地服务器
3. 右键点击 "Databases" → "Create" → "Database"
4. 输入数据库名称：`weroam`
5. 点击 "Save"

## 配置项目

### 1. 更新 .env 文件

在项目根目录创建或修改 `.env` 文件：

```env
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/weroam?schema=public"
```

**重要**：将 `你的密码` 替换为你在安装 PostgreSQL 时设置的密码。

### 2. 常见连接字符串格式

```
postgresql://用户名:密码@主机:端口/数据库名?schema=public
```

示例：
```env
# 本地开发（默认用户）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weroam?schema=public"

# 自定义用户
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/weroam?schema=public"

# 远程数据库
DATABASE_URL="postgresql://user:pass@server.example.com:5432/weroam?schema=public"

# Heroku
DATABASE_URL="postgres://user:pass@host.compute.amazonaws.com:5432/dbname"

# Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"
```

## 初始化数据库

### 1. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 2. 运行数据库迁移

```bash
npm run prisma:migrate
```

执行后会：
- 创建所有数据表（users, travel_posts, comments）
- 创建索引和关系
- 生成迁移历史

### 3. 填充测试数据

```bash
npm run prisma:seed
```

这将创建：
- 3 个测试用户
- 5 篇游记（包含图片和详细内容）
- 多条评论和回复

## 验证设置

### 1. 使用 Prisma Studio 查看数据

```bash
npm run prisma:studio
```

打开 http://localhost:5555，你应该能看到：
- users 表：3 条记录
- travel_posts 表：5 条记录
- comments 表：8 条记录

### 2. 使用 psql 查看

```bash
# 连接到数据库
psql -U postgres -d weroam

# 查看表
\dt

# 查看用户数据
SELECT id, username, nickname FROM users;

# 查看游记数据
SELECT id, title, location FROM travel_posts;

# 退出
\q
```

## 常见问题

### Q: 连接失败，报错 "connection refused"

**A:** 确保 PostgreSQL 服务正在运行：

```bash
# Windows
# 打开 "服务"，找到 PostgreSQL，确保状态是"运行中"

# macOS
brew services list
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Q: 密码错误，无法连接

**A:** 
1. 重置 postgres 用户密码：
   ```bash
   # Linux/macOS
   sudo -u postgres psql
   ALTER USER postgres PASSWORD '新密码';
   
   # Windows
   # 以管理员身份运行 psql
   psql -U postgres
   ALTER USER postgres PASSWORD '新密码';
   ```

2. 更新 `.env` 文件中的密码

### Q: 数据库已存在，如何重置？

**A:** 
```bash
# 删除并重新创建数据库
psql -U postgres
DROP DATABASE weroam;
CREATE DATABASE weroam;
\q

# 重新运行迁移和种子
npm run prisma:migrate
npm run prisma:seed
```

### Q: 如何备份数据库？

**A:** 
```bash
# 备份
pg_dump -U postgres weroam > backup.sql

# 恢复
psql -U postgres weroam < backup.sql
```

### Q: 端口 5432 被占用

**A:** 
1. 修改 PostgreSQL 端口（在 postgresql.conf 中）
2. 或者停止占用 5432 端口的其他服务
3. 更新 `.env` 中的端口号

## 生产环境推荐

### 云数据库服务

1. **Supabase** （推荐）
   - 提供免费套餐
   - 自带管理面板
   - 支持实时订阅
   - [注册地址](https://supabase.com/)

2. **Neon**
   - Serverless PostgreSQL
   - 按需计费
   - [注册地址](https://neon.tech/)

3. **Railway**
   - 简单易用
   - 自动备份
   - [注册地址](https://railway.app/)

4. **Heroku Postgres**
   - 提供免费层
   - 集成简单
   - [注册地址](https://www.heroku.com/postgres)

### 使用云数据库

1. 在云服务商创建 PostgreSQL 实例
2. 获取连接字符串
3. 更新 `.env` 文件
4. 运行迁移：`npm run prisma:migrate`
5. 填充数据：`npm run prisma:seed`

## 下一步

数据库设置完成后：

1. ✅ 启动开发服务器：`npm run dev`
2. ✅ 访问创建游记页面：http://localhost:3000/create-post
3. ✅ 测试发布游记功能
4. ✅ 实现用户认证功能
5. ✅ 开发游记展示和评论功能

## 有用的命令

```bash
# Prisma 相关
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 创建/应用迁移
npm run prisma:studio      # 打开可视化界面
npm run prisma:seed        # 填充测试数据

# PostgreSQL 相关
psql -U postgres           # 连接数据库
\l                         # 列出所有数据库
\c weroam                  # 切换数据库
\dt                        # 列出所有表
\d users                   # 查看表结构
\q                         # 退出

# 服务管理
# Windows: 服务管理器
# macOS: brew services start/stop postgresql@15
# Linux: sudo systemctl start/stop postgresql
```

## 资源链接

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL 指南](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [pgAdmin 文档](https://www.pgadmin.org/docs/)
- [PostgreSQL 教程](https://www.postgresqltutorial.com/)
