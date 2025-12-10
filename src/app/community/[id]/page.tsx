import { prisma } from '@/lib/prisma';
import PostDetail from './PostDetail';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

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

  // 获取当前用户状态
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let currentUserId: number | null = null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      currentUserId = payload.userId;
    }
  }

  let isLiked = false;
  let isFavorited = false;

  if (currentUserId) {
    const like = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: currentUserId,
          postId: postId,
        },
      },
    });
    isLiked = !!like;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: currentUserId,
          postId: postId,
        },
      },
    });
    isFavorited = !!favorite;
  }

  // 处理数据格式以匹配组件 Props
  // 注意：Prisma 返回的 tags 是 JSON 字符串，需要解析
  const formattedPost = {
    ...post,
    tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
    isLiked,
    isFavorited,
  };

  return <PostDetail post={formattedPost} />;
}