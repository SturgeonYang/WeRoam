# WeRoam Linux 生产环境部署指南

本文档将指导你将 WeRoam 应用部署到 Ubuntu Linux 服务器，并配置公网访问。

## 1. 服务器准备
- 购买一台 Linux 服务器 (推荐 Ubuntu 20.04 LTS 或 22.04 LTS)。
- 确保你拥有 `root` 权限或 `sudo` 权限。
- 打开必要的端口（云服务商的安全组设置）：
  - SSH: 22
  - HTTP: 80
  - HTTPS: 443

## 2. 安装基础环境

连接到服务器后，更新系统并安装必要软件：

```bash
# 更新软件包列表
sudo apt update && sudo apt upgrade -y

# 安装 Git, Nginx, 和 PostgreSQL
sudo apt install git nginx postgresql postgresql-contrib curl -y
```

### 安装 Node.js (LTS 版本)
```bash
# 下载 Node.js 18.x (或更高版本) 安装脚本
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 安装 PM2 (进程管理工具)
PM2 用于在后台运行 Next.js 应用，并在崩溃后自动重启。
```bash
sudo npm install -g pm2
```

## 3. 配置 PostgreSQL 数据库

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 进入数据库命令行
psql

# --- 在 psql 命令行中执行以下 SQL ---

# 1. 创建数据库
CREATE DATABASE weroam_db;

# 2. 创建用户 (请将 'secure_password' 替换为你的强密码)
CREATE USER weroam_user WITH ENCRYPTED PASSWORD 'secure_password';

# 3. 授权
GRANT ALL PRIVILEGES ON DATABASE weroam_db TO weroam_user;
ALTER DATABASE weroam_db OWNER TO weroam_user;

# 退出 psql
\q

# --- 回到 root 用户 ---
exit
```

## 4. 获取代码与安装依赖

```bash
# 进入 web 目录 (通常放在 /var/www)
cd /var/www

# 克隆代码 (建议使用 HTTPS 或者配置 SSH Key)
# 如果是私有仓库，需要先配置 GitHub SSH Key
git clone https://github.com/SturgeonYang/WeRoam.git weroam

# 进入项目目录
cd weroam

# 安装依赖
npm install
```

## 5. 环境变量配置

创建生产环境的 `.env` 文件：

```bash
cp .env.example .env.production
nano .env.production
```

**修改 `.env.production` 内容：**
确保 `DATABASE_URL` 使用你在第3步设置的账号密码：
```env
# 格式: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://weroam_user:secure_password@localhost:5432/weroam_db"

# Next.js 生产配置
NODE_ENV=production

# JWT加密密钥 (必须设置)
JWT_SECRET=generate_a_long_random_string

# AI 服务配置
QWEN_API_KEY=sk-62e8db0ef2ab4b1a9b175675ad25f02e
QWEN_API_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

## 6. 数据库迁移与构建

```bash
# 加载环境变量并生成 Prisma Client
npx dotenv -e .env.production -- npx prisma generate

# 执行数据库迁移 (在生产环境使用 migrate deploy)
npx dotenv -e .env.production -- npx prisma migrate deploy

# (可选) 填充初始数据
npx dotenv -e .env.production -- npx prisma db seed

# 构建 Next.js 应用
npm run build
```

## 7. 使用 PM2 启动应用

```bash
# 启动应用，指定端口为 3000
pm2 start npm --name "weroam" -- start

# 保存当前进程列表，以便重启服务器后自动启动
pm2 save
pm2 startup
```

## 8. 配置 Nginx 反向代理

Nginx 将作为网关，将公网流量转发给本地的 3000 端口。

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/weroam
```

**粘贴以下配置** (将 `your-domain.com` 替换为你的真实域名或服务器公网IP)：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com; # 如果没有域名，填写公网IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置并重启 Nginx：

```bash
# 建立软链接
sudo ln -s /etc/nginx/sites-available/weroam /etc/nginx/sites-enabled/

# 检查语法是否正确
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

此时，你应该可以通过 `http://your-domain.com` (或 IP) 访问应用了。

## 9. 配置 HTTPS (推荐)

如果你有域名，强烈建议配置 SSL 证书。

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 自动获取并配置证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot 会自动修改 Nginx 配置以启用 HTTPS。

---

## 常用维护命令

- **查看日志**: `pm2 logs weroam`
- **重启应用**: `pm2 restart weroam`
- **更新代码**:
  1. `git pull`
  2. `npm install` (如果依赖变更)
  3. `npx prisma migrate deploy` (如果数据库变更)
  4. `npm run build`
  5. `pm2 restart weroam`
