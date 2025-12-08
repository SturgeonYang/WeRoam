# WeRoam 本地部署指南

这份文档旨在帮助团队成员在本地环境中顺利部署和运行 WeRoam 项目。

## 1. 环境准备 (Prerequisites)

在开始之前，请确保你的电脑上安装了以下软件：

### 1.1 Node.js & npm
- **版本要求**: Node.js v18.0.0 或更高版本。
- **下载地址**: [Node.js 官网](https://nodejs.org/)
- **验证安装**:
  
  ```bash
  node -v
  npm -v
  ```

### 1.2 Git
- **下载地址**: [Git 官网](https://git-scm.com/)
- **验证安装**:
  
  ```bash
  git --version
  ```

### 1.3 PostgreSQL 16.11
项目使用 PostgreSQL 作为数据库。

#### Windows 安装步骤:
1. **下载**: 访问 [PostgreSQL Windows 下载页](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)，选择版本 **16.11** (或 16.x 系列的最新版) 进行下载。

2. **安装**:
   
   - 运行安装程序。
   
   - 安装过程中会提示设置 **超级用户 (postgres) 的密码**，请**务必**记住这个密码（后续配置 `.env` 需要用到）。
   
   - 端口修改为 `5433`。
   
     （因为我这里5432被占用了，往后推了一个端口，如果没有被占用就用5432，并修改.env文件里的端口和密码）![image-20251208164422623](attachments/image-20251208164422623.png)
   
   - Locale 选择默认即可。
   
3. **验证安装**:
   - 打开 "SQL Shell (psql)"。
   - 按回车接受默认值，直到提示输入密码。
   - 输入安装时设置的密码，成功登录即表示安装成功。

---

## 2. 获取代码与安装依赖

1. **克隆/下载代码**:
   如果你是从 Git 仓库下载：
   
   ```bash
   git clone <repository-url>
   cd weroam
   ```
   如果是直接拷贝的文件夹，请直接进入 `weroam` 目录。
   
2. **安装依赖**:
   在项目根目录下运行：
   
   ```bash
   npm install
   ```

---

## 3. 数据库配置

### 3.1 创建数据库
你需要创建一个名为 `weroam` 的空数据库。可以使用 pgAdmin (安装 Postgres 时自带的图形界面) 或命令行。

**命令行方式**:
打开终端或 SQL Shell，运行：

```bash
createdb -U postgres weroam
```
*(提示输入密码时，输入安装 Postgres 时设置的密码)*

### 3.2 配置环境变量
1. 在项目根目录下找到 `.env.example` 文件。
2. 复制一份并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```
   *(Windows 用户可以直接复制粘贴文件并重命名)*
3. 打开 `.env` 文件，修改 `DATABASE_URL`：
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/weroam?schema=public"
   ```
   - 将 `YOUR_PASSWORD` 替换为你安装 PostgreSQL 时设置的密码。
   - 如果你的用户名不是 `postgres`，请相应修改。

---

## 4. 数据库迁移与数据填充

在项目根目录下依次运行以下命令，初始化数据库结构并填充测试数据：

1. **生成 Prisma 客户端**:
   ```bash
   npx prisma generate
   ```

2. **同步数据库结构**:
   ```bash
   npx prisma db push
   ```
   *(或者使用 `npx prisma migrate dev` 创建迁移记录)*

3. **填充初始数据 (Seeds)**:
   项目包含预置的测试用户和帖子数据。
   ```bash
   npm run prisma:seed
   ```
   *如果看到 "Seeding finished." 字样，说明数据填充成功。*

---

## 5. 启动项目

一切准备就绪，启动开发服务器：

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)，你应该能看到 WeRoam 的首页。

---

## 7. 常见问题排查

- **Error: P1001: Can't reach database server**:
  - 检查 PostgreSQL 服务是否已启动。
  - 检查 `.env` 文件中的密码和端口是否正确。

- **Error: P1003: Database does not exist**:
  - 确认是否已创建 `weroam` 数据库 (步骤 3.1)。

- **依赖安装失败**:
  - 尝试删除 `node_modules` 文件夹和 `package-lock.json`，然后重新运行 `npm install`。
