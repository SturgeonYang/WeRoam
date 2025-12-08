import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function main() {
  console.log('🔍 开始诊断数据库连接...');
  
  const currentUrl = process.env.DATABASE_URL;
  console.log(`\n当前配置的连接字符串: ${currentUrl}`);

  if (!currentUrl) {
    console.error('❌ 未找到 DATABASE_URL 环境变量');
    return;
  }

  // 尝试连接
  console.log('\n1️⃣ 尝试使用当前配置连接...');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ 连接成功！当前配置是正确的。');
    await prisma.$disconnect();
    return;
  } catch (e: any) {
    console.log('❌ 连接失败:', e.message.split('\n').pop()); // 只显示最后一行错误
  }

  // 如果失败，尝试常见密码
  console.log('\n2️⃣ 尝试常见密码组合...');
  const commonPasswords = ['123456', 'admin', 'root', 'password', 'postgres'];
  
  // 解析当前 URL
  // 假设格式: postgresql://user:pass@host:port/db
  const urlParts = currentUrl.match(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/);
  
  if (!urlParts) {
    console.log('⚠️ 无法解析连接字符串格式，跳过密码猜测。');
    return;
  }

  const [_, prefix, currentPass, suffix] = urlParts;

  for (const pass of commonPasswords) {
    if (pass === currentPass) continue; // 跳过已试过的

    const tryUrl = `${prefix}${pass}${suffix}`;
    console.log(`   尝试密码: "${pass}" ...`);
    
    const tryPrisma = new PrismaClient({
      datasources: { db: { url: tryUrl } }
    });

    try {
      await tryPrisma.$connect();
      console.log(`\n🎉 找到正确密码！是: "${pass}"`);
      console.log(`👉 请修改 .env 文件中的 DATABASE_URL 为:`);
      console.log(`   DATABASE_URL="${tryUrl}"`);
      await tryPrisma.$disconnect();
      return;
    } catch (e) {
      // 忽略错误，继续尝试
      await tryPrisma.$disconnect();
    }
  }

  console.log('\n❌ 未能自动找到正确密码。');
  console.log('请回忆您安装 PostgreSQL 时设置的超级用户密码。');
  console.log('如果您忘记了密码，可能需要重置 PostgreSQL 密码。');
}

main();
