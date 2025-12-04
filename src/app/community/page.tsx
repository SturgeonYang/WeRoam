import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import CommunityList from './CommunityList';
import Link from 'next/link';

// 这是一个异步的服务端组件
export default async function CommunityPage() {
  // 1. 从数据库获取原始数据
  const rawPosts = await prisma.travelPost.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });

  // 2. 数据处理：把 tags 字符串 (JSON) 转成数组
  const posts = rawPosts.map((post) => {
    let tags: string[] = [];
    try {
      if (post.tags) {
        tags = JSON.parse(post.tags);
      }
    } catch (e) {
      console.error(`解析游记 ${post.id} 的标签失败`, e);
      tags = [];
    }

    return {
      ...post,
      tags,
    };
  });

  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-200 shadow-sm border-b border-yellow-200 overflow-hidden relative">
        <div className="container mx-auto px-4 py-16 relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-yellow-900 drop-shadow-sm">
              探索世界 <span className="text-yellow-700">WeRoam</span>
            </h1>

            <p className="text-lg text-yellow-800 max-w-2xl font-medium">
              发现令人惊叹的目的地，阅读真实的旅行故事，规划你的下一次冒险。
            </p>

            {/* 指向 /create-post */}
            <Link
              href="/create-post"
              className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="mr-2">✏️</span>
              发布游记
            </Link>
          </div>

          <div className="hidden md:block animate-float opacity-90">
            {/* 装饰插画（如果有的话） */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <CommunityList initialPosts={posts} />
      </div>
    </div>
  );
}