/**
 * Prisma Client 初始化
 * 
 * 在开发环境中，由于 Next.js 的热重载机制，需要使用全局变量来避免
 * 创建多个 Prisma Client 实例导致的数据库连接池耗尽问题
 */

import { PrismaClient } from '@/generated/prisma';

// 声明全局类型以存储 Prisma Client 实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 创建或复用 Prisma Client 实例
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 在开发环境中将实例保存到全局变量
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
