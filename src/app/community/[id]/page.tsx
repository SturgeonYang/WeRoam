import { prisma } from '@/lib/prisma';
import PostDetail from './PostDetail';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // --- 必须转换类型 ---
  const postId = parseInt(id);
  
  if (isNaN(postId)) {
    notFound();
  }

  const post = await prisma.travelPost.findUnique({
    where: { id: postId }, // 这里传入数字
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 处理数据格式以匹配组件 Props
  // 注意：Prisma 返回的 tags 是 JSON 字符串，需要解析
  const formattedPost = {
    ...post,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
  };

  return <PostDetail post={formattedPost} />;
}