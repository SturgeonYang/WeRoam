# 修复 PM2/NVM "incompatible with nvm" 错误

这个错误是因为你的用户配置文件 `.npmrc` 中设置了固定的 `prefix` 路径，这与 `nvm` (Node Version Manager) 的动态路径管理机制冲突。`nvm` 需要完全控制 `prefix` 才能切换 Node 版本。

请按照以下步骤永久修复此问题：

## 方法 1: 删除冲突的配置 (推荐 - 永久修复)

在终端中执行以下命令，删除全局配置中的 `prefix` 选项：

```bash
npm config delete prefix
npm config delete prefix --global
```

如果上述命令不生效，可以手动编辑配置文件：

1.  打开配置文件：
    ```bash
    nano ~/.npmrc
    ```
2.  找到以 `prefix=` 开头的行（例如 `prefix=/usr/local` 或 `prefix=/root/.npm-global`）。
3.  **删除这一行**。
4.  保存并退出 (按 `Ctrl+O` 回车，然后 `Ctrl+X`)。
5.  重新加载环境：
    ```bash
    source ~/.bashrc
    ```

再次运行 PM2 命令，应该就不会报错了。

## 方法 2: 使用 nvm 自动修复 (临时)

按照报错提示执行命令（根据你的 Node 版本，版本号可能不同）：

```bash
nvm use --delete-prefix v18.16.0  # 请替换为你当前使用的版本号
```

*注意：这只是在当前会话中修复，下次登录可能还会报错。建议使用方法 1。*

## 方法 3: 重新安装 PM2 (如果 PM2 是在旧环境中安装的)

有时候即使修好了配置，旧的 PM2 进程还在引用旧路径。

```bash
# 1. 卸载 PM2
npm uninstall -g pm2

# 2. 确保环境正常 (确认 node 和 npm 是 nvm 管理的路径)
nvm use default

# 3. 重新安装
npm install -g pm2

# 4. 更新 PM2 内存中的进程列表
pm2 update
```
