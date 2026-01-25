# WeRoam aaPanel (宝塔国际版) 部署指南

使用可视化的 aaPanel 面板可以大大简化 Linux 服务器的运维工作。本指南将指导你通过 aaPanel 部署 WeRoam。

## 1. 准备工作

确保你的服务器已经安装了 aaPanel。如果没有，请参考 aaPanel 官网进行安装。
登录面板后，如果不熟悉英文，可以在 Settings 中将语言改为中文（如果是宝塔面板则默认中文）。

## 2. 安装运行环境

进入 **App Store (软件商店)**，安装以下插件：

1.  **Nginx** (建议 1.21 或更高) - *Web 服务器*
2.  **PostgreSQL Manager** (建议 14 或 15) - *数据库*
3.  **Node.js Version Manager** - *Node 环境管理*
4.  **PM2 Manager** - *进程守护管理*

### 配置 Node.js
1. 打开 **Node.js Version Manager**。
2. 在列表中找到 **v18.x** (或更高版本，推荐 LTS)。
3. 点击 **Install**。
4. 安装完成后，点击 **Set as default** (设为命令行默认版本)。

## 3. 配置数据库

1. 打开 **Databases (数据库)** 菜单。
2. 切换到 **PostgreSQL** 标签页（如果没有，请确认 PostgreSQL Manager 是否已启动并初始化）。
3. 点击 **Add Database**。
   - **DBName**: `weroam_db`
   - **User**: `weroam_user`
   - **Password**: 设置一个强密码（面板会自动生成一个，复制下来）。7bH4SjnMBPFTbxjj
4. 点击 Submit。

## 4. 获取代码与配置环境

### 上传代码
1. 进入 **Files (文件)** 菜单。
2. 进入 `/www/wwwroot/` 目录。
3. 点击 **Terminal** 打开终端，或者使用 git clone：
   ```bash
   git clone https://github.com/SturgeonYang/WeRoam.git weroam
   ```
   也可以直接在本地打包项目为 `zip`，通过面板的 **Upload** 按钮上传并解压。

### 配置环境变量
1. 进入 `/www/wwwroot/weroam` 目录。
2. 找到 `.env.example` 文件，点击 **Edit**，或新建一个 `.env` 文件。
3. 填入以下内容：
   ```env
   # 注意：aaPanel 的 PostgreSQL 默认端口通常也是 5432
   DATABASE_URL="postgresql://weroam_user:YOUR_PASSWORD@127.0.0.1:5432/weroam_db"
   
   ```
4. 保存文件。

## 5. 安装依赖与构建

在 `/www/wwwroot/weroam` 目录下打开 **Terminal** (或者在面板左侧菜单打开 Terminal 并 cd 到该目录)：

```bash
# 1. 安装依赖
npm install

# 2. 数据库迁移 (创建表结构)
npx prisma migrate deploy

# 3. 填充基础数据 (可选)
npx prisma db seed

# 4. 构建项目
npm run build
```
*注意：如果报错内存不足 (OOM)，可以尝试在面板首页增加 Swap 分区。*

## 6. 启动项目 (使用 PM2)

我们使用 PM2 Manager 来后台运行项目，而不是直接在 Node 项目里跑。

1. 打开 **App Store** -> **PM2 Manager**。
2. 点击 **Add project**。
   - **Startup File**: 点击文件夹图标，选择 `/www/wwwroot/weroam/` 目录。这里**不要**选具体文件，保持在根目录选择状态，或者手动输入路径。
   - **Run Command**: `npm start` (或者 `npm run start`)
   - **Name**: `weroam`
3. 点击 **Submit**。
4. 现在要在列表中看到 weroam 状态为 Online (绿色)。

## 7. 配置域名与反向代理 (Nginx)

为了通过域名访问 3000 端口，我们需要配置反向代理。

1. 进入 **Website (网站)** 菜单。
2. 点击 **Add site (添加网站)** -> **PHP Project** (即使我们是 Node 项目，为了方便配置反代，通常选这个通用的静态/PHP 模式)。
   - **Domain**: 填写你的域名 (如 `weroam.com`) 或公网 IP。
   - **PHP Version**: Static (纯静态)。
   - 点击 **Submit**。
3. 在网站列表中，点击刚创建网站的 **Conf (设置)** 或者域名本身。
4. 在弹出的窗口中，左侧菜单选择 **Reverse Proxy (反向代理)**。
5. 点击 **Add Reverse Proxy**。
   - **Proxy Name**: `weroam_app`
   - **Target URL**: `http://127.0.0.1:3000`
   - **Sent Domain**: `$host`
6. 点击 **Submit**。

## 8. 配置 SSL (HTTPS)

1. 在刚才的网站设置窗口中，选择 **SSL**。
2. 选择 **Let's Encrypt**。
3. 勾选你的域名，点击 **Apply**。
4. 申请成功后，开启 **Force HTTPS (强制 HTTPS)**。

---

## 常见问题

- **数据库连接失败**：检查 `.env` 中的密码是否正确，确保 PostgreSQL 服务在 App Store 中显示为已启动。
- **构建失败**：Next.js 构建比较吃内存，小内存 VPS (如 1G) 建议在面板首页 Linux 工具箱里添加 2GB 的虚拟内存 (Swap)。
- **样式加载不出来**：检查 `.env` 中的 `NEXTAUTH_URL` 是否与当前访问的域名一致。
