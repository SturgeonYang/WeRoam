# npm command not found 故障排查指南

在 aaPanel 终端中遇到 `npm not found` 主要是因为环境变量没有自动加载。

## 解决方法 1: 重新加载环境变量 (最快)

在终端运行以下命令：
```bash
source ~/.bashrc
source /etc/profile
```
然后再次尝试 `npm -v`。

## 解决方法 2: 使用 Node 全局路径 (最稳)

如果方法 1 无效，说明 Node.js 没有被添加进系统 PATH。

1.  找到 aaPanel 安装的 Node.js 路径。通常是：
    *   `/www/server/nodejs/v18.x.x/bin/npm`
    *   (具体路径取决于你安装的版本)

2.  你可以直接创建一个软链接到系统的 `/usr/bin` 目录：
    ```bash
    # 注意：请将 'v18.16.0' 替换为你实际安装的版本号
    ln -sf /www/server/nodejs/v18.16.0/bin/node /usr/bin/node
    ln -sf /www/server/nodejs/v18.16.0/bin/npm /usr/bin/npm
    ln -sf /www/server/nodejs/v18.16.0/bin/npx /usr/bin/npx
    ```

## 解决方法 3: 在 aaPanel 面板中修复

1.  回到面板首页 -> **Website** -> **Node project** -> **Node version manager**。
2.  确保你已经勾选了所需的 Node 版本，并点击了 **Set as default** (设为默认)。
3.  如果不生效，尝试**重启面板**或重新打开终端窗口。

## 解决方法 4: 临时解决

如果只是想赶紧跑完命令，可以直接用全路径执行：

```bash
/www/server/nodejs/v<版本号>/bin/npm install
/www/server/nodejs/v<版本号>/bin/npx prisma migrate deploy
/www/server/nodejs/v<版本号>/bin/npm run build
```
