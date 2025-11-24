/**
 * 数据库连接检查脚本
 * 用于验证 PostgreSQL 数据库配置是否正确
 * 运行: npx tsx prisma/check-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 正在检查数据库连接...\n');

  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 测试数据库连接...');
    await prisma.$connect();
    console.log('   ✅ 数据库连接成功！\n');

    // 2. 检查数据库类型
    console.log('2️⃣ 检查数据库类型...');
    const result = await prisma.$queryRaw`SELECT version()` as any[];
    const version = result[0]?.version || 'Unknown';
    
    if (version.toLowerCase().includes('postgresql')) {
      console.log('   ✅ 使用 PostgreSQL 数据库');
      console.log(`   📌 版本信息: ${version.split(',')[0]}\n`);
    } else {
      console.log(`   ⚠️  警告：当前数据库类型可能不是 PostgreSQL`);
      console.log(`   📌 检测到: ${version}\n`);
    }

    // 3. 检查表是否存在
    console.log('3️⃣ 检查数据表...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as any[];

    if (tables.length === 0) {
      console.log('   ⚠️  警告：未找到任何数据表');
      console.log('   💡 提示：请先运行 "npm run prisma:migrate" 创建数据表\n');
    } else {
      console.log(`   ✅ 找到 ${tables.length} 个数据表:`);
      tables.forEach((table: any) => {
        console.log(`      - ${table.table_name}`);
      });
      console.log();
    }

    // 4. 检查数据
    console.log('4️⃣ 检查测试数据...');
    const [userCount, postCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.travelPost.count(),
      prisma.comment.count(),
    ]);

    if (userCount === 0 && postCount === 0 && commentCount === 0) {
      console.log('   ⚠️  警告：数据库为空，没有测试数据');
      console.log('   💡 提示：请运行 "npm run prisma:seed" 填充测试数据\n');
    } else {
      console.log('   ✅ 找到测试数据:');
      console.log(`      - 用户: ${userCount} 个`);
      console.log(`      - 游记: ${postCount} 篇`);
      console.log(`      - 评论: ${commentCount} 条\n`);
    }

    // 5. 显示数据库连接信息
    console.log('5️⃣ 数据库连接信息:');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // 隐藏密码
      const safeUrl = dbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1***$3');
      console.log(`   📌 连接字符串: ${safeUrl}\n`);
    } else {
      console.log('   ⚠️  警告：未找到 DATABASE_URL 环境变量\n');
    }

    console.log('✅ 数据库检查完成！\n');

    // 如果有数据，显示一些示例
    if (userCount > 0) {
      console.log('📝 示例数据预览:');
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        select: { username: true, nickname: true, location: true },
      });
      console.log('   用户示例:');
      sampleUsers.forEach(user => {
        console.log(`      - ${user.username} (${user.nickname}) - ${user.location}`);
      });
      console.log();
    }

    if (postCount > 0) {
      const samplePosts = await prisma.travelPost.findMany({
        take: 3,
        select: { title: true, location: true, viewCount: true, likeCount: true },
      });
      console.log('   游记示例:');
      samplePosts.forEach(post => {
        console.log(`      - ${post.title} (${post.location}) - ${post.viewCount}浏览 ${post.likeCount}点赞`);
      });
      console.log();
    }

  } catch (error: any) {
    console.error('❌ 数据库检查失败！\n');
    
    if (error.code === 'P1001') {
      console.error('💡 错误原因：无法连接到数据库服务器');
      console.error('   请检查：');
      console.error('   1. PostgreSQL 服务是否正在运行');
      console.error('   2. .env 文件中的 DATABASE_URL 是否正确');
      console.error('   3. 数据库用户名和密码是否正确');
      console.error('   4. 数据库 weroam 是否已创建\n');
    } else if (error.code === 'P1003') {
      console.error('💡 错误原因：数据库不存在');
      console.error('   请先创建数据库：');
      console.error('   psql -U postgres');
      console.error('   CREATE DATABASE weroam;\n');
    } else {
      console.error('💡 详细错误信息：');
      console.error(`   ${error.message}\n`);
    }

    console.error('📚 查看帮助文档：');
    console.error('   - POSTGRESQL_SETUP.md - PostgreSQL 安装和配置');
    console.error('   - PRISMA_SETUP.md - Prisma 使用指南\n');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
