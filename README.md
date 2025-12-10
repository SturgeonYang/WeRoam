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
  - 尝试删除 `node_modules` 文件夹和 `package-lock.json`，然后重新运行 `npm install`



---

# 旧的内容



## 项目背景

北京邮电大学2024级信息工程 - 程序设计实验 - 课程大作业

云旅札记 ( WeRoam ) —— AI 驱动的智能旅行规划助手

## 环境和框架

- Node.js : v22.18.0
- npm : 11.5.2
- Next.js : 15.5.4
- React : 19.1.0

## ✨ 功能特色

### 🤖 AI 智能对话
- 实时 WeRoam 助手
- 个性化旅行建议
- 智能行程规划
- 一键保存到社区

### 🌍 旅行社区
- 分享旅行经验
- 浏览精彩游记
- 互动点赞评论
- 标签分类浏览

### 👤 个人中心
- 个人资料管理
- 发布游记管理
- 收藏夹功能
- AI 对话历史

## 🎨 设计理念

- **配色方案**: 以淡黄色和白色为主色调，营造温暖舒适的旅行氛围
- **响应式设计**: 完美适配桌面端和移动端
- **现代化界面**: 简洁优雅的 UI 设计，注重用户体验
- **流畅动效**: 细腻的过渡动画和交互效果

## 📦 项目结构

```
src/
├── app/                    # Next.js 页面
│   ├── page.tsx           # 首页
│   ├── community/         # 社区页面
│   ├── profile/           # 个人中心
│   ├── layout.tsx         # 全局布局
│   └── globals.css        # 全局样式
├── components/            # 组件库
│   ├── Navbar.tsx         # 导航栏
│   ├── AIChat.tsx         # AI 对话框
│   └── TravelPosts.tsx    # 旅游帖子
└── public/               # 静态资源
```

## 🛠️ 本地开发

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📱 页面展示

### 首页
- AI 对话框，智能旅行规划
- 热门旅游经验展示
- 响应式网格布局

### 社区页面
- 旅游经验分类筛选
- 游记浏览和互动
- 发布游记功能

### 个人中心
- 用户资料展示
- 个人游记管理
- 统计数据面板

Next.js : 15.5.4

## 合作开发规范

### 环境准备

1. [Releases · coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
   里面下载最新版的nvm-setup.exe并安装
   版本为1.2.2

2. cmd里输入`nvm install 22`
   安装node.js 22.18.0（会同步安装npm11.5.2）

3. 安装git
   [Git是什么 - Git教程 - 廖雪峰的官方网站](https://liaoxuefeng.com/books/git/what-is-git/index.html)

4. 在 https://github.com/SturgeonYang/WeRoam 里面点击右上角的fork，把仓库镜像到你的账户上（私有或者公开都行）

5. 在本地挑选一个文件夹（无中文路径），右键打开 git bash 终端

6. 按照 https://blog.csdn.net/weixin_42310154/article/details/118340458 的教程配置 ssh 密钥

7. 在终端进入步骤5挑选的文件夹后，`git remote add origin git@github.com:你的GithubID/WeRoam.git`

8. `git branch -m master main`将本地默认的 master 分支名改成 main

9. 运行 `git clone` 命令，克隆远程仓库到本地。
    ```
    git clone git@github.com:你的GithubID/WeRoam.git
    ```
10. 进入本地仓库对应的文件夹，在当前路径右键打开 git bash 或者 cmd
11. 先输入 `npm install`，部署一下
12. 输入 `npm run dev`，若显示如图，就成功了，点开里面的网址即可访问![image-20251001222922852](attachments/image-20251001222922852.png)



### 协作开发规范

**规则：不能直接向 `main` 分支推送（push）代码** 
所有的代码变更都必须通过 **Pull Request (PR)** 的方式进行。

下面是**每一次**开发新功能或修复 Bug 的标准流程：

1. 第一步：同步最新代码
   
    在开始写任何新代码之前，永远先确保你的本地 main 分支是最新版本。
    
    ```Bash
    # 切换到 main 分支
    git checkout main
    
    # 从远程仓库拉取最新的 main 分支代码
    git pull origin main
    ```
    
2. 第二步：创建自己的开发分支 (Feature Branch)
   
    为你要做的新功能创建一个新的分支。分支命名要有意义，例如：
    
    Bash
    
    ```
    # -b 参数表示创建并立即切换到这个新分支
    # 示例1: 开发“关于我们”页面
    git checkout -b feature/about-us-page
    
    # 示例2: 修复导航栏的 bug
    git checkout -b fix/navbar-style
    ```
    
3. 第三步：在新分支上进行开发
   
    现在你可以在这个独立的分支上安心写代码了，不会影响到主分支和其他人。
    
    - 比如，创建新的页面、组件，修改样式等。
      
    - 你可以随时进行提交（commit）来保存你的进度。
      
        Bash
        
        ```
        # 添加你想保存的文件
        git add .  # "." 代表所有修改过的文件
        
        # 提交你的更改，并写清楚本次提交做了什么
        git commit -m "Feat: Create basic structure for About Us page"
        ```
    
4. 第四步：将自己的分支推送到远程仓库
   
    当你觉得这个功能开发完成，或者需要其他人看到你的代码时，就把它推送到 GitHub。
    
    ```Bash
    # 'origin' 是你的远程仓库，后面是你的分支名
    git push origin feature/about-us-page
    ```
    
5. 第五步：创建 Pull Request (PR)
   
    推送成功后，打开你们的 GitHub 仓库页面，通常会看到一个黄色的提示条，让你为你刚刚推送的分支创建一个 Pull Request。
    
    - 点击 `Compare & pull request` 按钮。
      
    - 写清楚这个 PR 的标题和描述，说明你完成了什么功能，解决了什么问题。
      
    - 在右侧的 `Reviewers` 里，选择一到两位团队成员来审查你的代码。
      
    - 点击 `Create pull request`。
    
    

### 项目结构概览 (`src` 目录)

- `src/app/page.tsx`: 这是你的网站首页。
- `src/app/layout.tsx`: 这是全局布局文件，所有页面都会应用这个布局。可以在这里放页头（Header）、页脚（Footer）。
- `src/app/globals.css`: 全局 CSS 文件，用于统一样式，比如字体、颜色等等。
- 其他部分想到什么都能用AI生成（，不用手搓
