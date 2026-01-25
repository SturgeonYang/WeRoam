# 修复 PostgreSQL "permission denied for schema public" 错误

这个错误说明你的数据库用户 (`weroam_user`) 没有权限在 `weroam_db` 数据库的 `public` schema 中创建表。

请按照以下步骤修复权限：

## 方法 1: 使用 psql 命令行修复 (推荐)

在终端中执行以下命令：

1.  **切换到 postgres 超级用户**：
    ```bash
    sudo -i -u postgres
    ```

2.  **进入 PostgreSQL 命令行**：
    ```bash
    psql
    ```

3.  **连接到你的数据库**：
    ```sql
    \c weroam_db
    ```
    *提示：此时你应该看到提示符变为 `weroam_db=#`*

4.  **执行权限修复 SQL (逐行执行)**：
    ```sql
    -- 将 public schema 的所有权移交给你的用户
    ALTER SCHEMA public OWNER TO weroam_user;
    
    -- 授予在该 schema 下的所有权限
    GRANT ALL ON SCHEMA public TO weroam_user;
    
    -- 授予在该数据库上的所有权限 (保险起见)
    GRANT ALL PRIVILEGES ON DATABASE weroam_db TO weroam_user;
    
    -- 确保用户也能操作 public schema 下未来创建的表
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO weroam_user;
    ```

5.  **退出**：
    ```sql
    \q
    ```
    ```bash
    exit
    ```

## 方法 2: 使用 aaPanel 数据库管理工具

如果 aaPanel 安装了 phpMyAdmin 类似的 PostgreSQL 管理工具 (如 pgAdmin，虽然 aaPanel 不一定自带)，你可以在 SQL 执行窗口运行上述 SQL 语句。

但通常直接用 SSH 终端是最快最稳的。

---

## 验证修复

修复完成后，回到你的项目目录 (`/www/wwwroot/weroam`)，再次运行迁移命令：

```bash
npx prisma migrate deploy
```

这次应该就会显示 `No pending migrations to apply` 或成功应用迁移了。
