'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

// 定义评论接口
interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  likeCount: number;
  author: {
    id: number;
    username: string;
    nickname?: string | null;
    avatar: string | null;
  };
  replies?: Comment[]; // 子评论
  parentId?: number | null;
  isLiked?: boolean; // 当前用户是否点赞
}

interface PostDetailProps {
  post: {
    id: number;
    title: string;
    content: string;
    location?: string | null;
    coverImage?: string | null;
    tags?: string[];
    likeCount: number;
    authorId: number;
    author: {
      id: number;
      username: string;
      nickname?: string | null;
      avatar?: string | null;
    };
    comments: Comment[];
    isLiked?: boolean;
    isFavorited?: boolean;
  };
}

const formatDate = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

// Helper to organize flat comments into tree structure
const organizeComments = (flatComments: Comment[]): Comment[] => {
  const commentMap = new Map<number, Comment>();
  const roots: Comment[] = [];

  // Deep copy to avoid mutating props
  const comments = flatComments.map(c => ({ ...c, replies: [] }));

  // First pass: create map
  comments.forEach(c => {
    commentMap.set(c.id, c);
  });

  // Second pass: link children to parents
  comments.forEach(c => {
    if (c.parentId) {
      const parent = commentMap.get(c.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(c);
      } else {
        roots.push(c);
      }
    } else {
      roots.push(c);
    }
  });

  // Sort replies by time (oldest first)
  roots.forEach(root => {
    if (root.replies) {
      root.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  });

  return roots;
};

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // 状态管理
  // Initialize with organized comments
  const [comments, setComments] = useState<Comment[]>(() => organizeComments(post.comments || []));
  const [newComment, setNewComment] = useState('');
  const [sortOrder, setSortOrder] = useState<'hot' | 'new'>('hot');
  const [isDeleting, setIsDeleting] = useState(false);

  // Post interaction states
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);

  // --- 排序逻辑 ---
  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === 'hot') {
      return b.likeCount - a.likeCount; // 热度：点赞多的在前
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 时间：新的在前
    }
  });

  // --- 交互处理函数 ---

  const handleLikePost = async () => {
    if (!user) return router.push('/login');
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1);
      }
    } catch (e) { console.error(e); }
  };

  const handleFavoritePost = async () => {
    if (!user) return router.push('/login');
    try {
      const res = await fetch(`/api/posts/${post.id}/favorite`, { method: 'POST' });
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (e) { console.error(e); }
  };

  const handleSharePost = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板');
    });
  };

  // 1. 发布评论
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('请先登录');
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: post.id
        }),
      });

      if (!res.ok) throw new Error('Failed to comment');

      const savedComment = await res.json();
      setComments([savedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error(error);
      alert('评论失败，请重试');
    }
  };

  // 2. 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      // 更新状态：可能是主评论，也可能是子评论
      setComments(prev => {
        // 1. 尝试从顶层移除
        const isTopLevel = prev.some(c => c.id === commentId);
        if (isTopLevel) {
          return prev.filter(c => c.id !== commentId);
        }
        // 2. 尝试从子评论移除
        return prev.map(c => {
          if (c.replies && c.replies.some(r => r.id === commentId)) {
            return {
              ...c,
              replies: c.replies.filter(r => r.id !== commentId)
            };
          }
          return c;
        });
      });
    } catch (error: any) {
      console.error(error);
      alert(`删除失败: ${error.message}`);
    }
  };

  // 3. 点赞评论
  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to like');
      }

      const { liked } = await res.json();

      setComments(prevComments => prevComments.map(c => {
        // 1. Check if it's the top-level comment
        if (c.id === commentId) {
          return { 
            ...c, 
            likeCount: liked ? c.likeCount + 1 : c.likeCount - 1,
            isLiked: liked
          };
        }
        // 2. Check if it's in replies
        if (c.replies && c.replies.some(r => r.id === commentId)) {
           return {
               ...c,
               replies: c.replies.map(r => r.id === commentId ? {
                   ...r,
                   likeCount: liked ? r.likeCount + 1 : r.likeCount - 1,
                   isLiked: liked
               } : r)
           };
        }
        return c;
      }));
    } catch (error: any) {
      console.error(error);
      alert(`操作失败: ${error.message}`);
    }
  };

  // 4. 回复评论
  const handleReplyComment = async (parentId: number, content: string) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          postId: post.id,
          parentId
        }),
      });

      if (!res.ok) throw new Error('Failed to reply');

      const savedReply = await res.json();

      // 找到对应的父评论，把新回复加进去
      // 注意：这里假设后端返回的 savedReply 结构正确
      // 如果是两级评论结构，通常需要刷新或重新组织数据
      // 这里简单处理：如果是嵌套显示，需要更新对应父评论的 replies
      // 但当前 UI 似乎只支持一级回复显示在父评论下，或者平铺
      // 假设 UI 支持 replies 字段
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), savedReply]
          };
        }
        return c;
      }));
    } catch (error) {
      console.error(error);
      alert('回复失败');
    }
  };

  // 5. 删除帖子
  const handleDeletePost = async () => {
    if (!confirm('确定要删除这篇游记吗？此操作无法撤销。')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      router.push('/community');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('删除失败，请重试');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen shadow-sm">
      {/* 返回按钮 */}
      <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-yellow-600 flex items-center gap-2 transition-colors">
        ← 返回
      </button>

      {/* 文章头部 */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          {user && user.id === post.authorId && (
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/edit-post/${post.id}`)}
                className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
              >
                编辑
              </button>
              <button 
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                {isDeleting ? '删除中...' : '删除游记'}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-6">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/user/${post.author.username}`)}>
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-200">
              <img 
                src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author.username)}`} 
                alt={post.author.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 hover:text-yellow-600 transition-colors">{post.author.nickname || post.author.username}</p>
              <p>{post.location || '未知地点'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-gray-500">
              <svg 
                className="w-4 h-4 text-red-500 fill-red-500" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likeCount} 喜欢</span>
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{comments.length} 评论</span>
            </span>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="prose max-w-none mb-12">
        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden shadow-md">
            <Image 
              src={post.coverImage.startsWith('http') || post.coverImage.startsWith('/') ? post.coverImage : `/${post.coverImage}`}
              alt={post.title} 
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{post.content}</div>
        
        {/* 标签 */}
        <div className="mt-8 flex gap-2">
          {post.tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-6">
             {/* Share */}
             <button 
               onClick={handleSharePost}
               className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
               </svg>
               <span className="text-sm">分享</span>
             </button>

             {/* Like */}
             <button 
               onClick={handleLikePost}
               className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
             >
               <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
               <span className="text-sm">{likeCount || '点赞'}</span>
             </button>

             {/* Comment */}
             <button 
               onClick={() => document.querySelector('textarea')?.focus()}
               className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
               <span className="text-sm">{comments.length || '评论'}</span>
             </button>

             {/* Favorite */}
             <button 
               onClick={handleFavoritePost}
               className={`flex items-center gap-2 transition-colors ${isFavorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
             >
               <svg className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
               </svg>
               <span className="text-sm">{isFavorited ? '已收藏' : '收藏'}</span>
             </button>
          </div>
        </div>
      </article>

      {/* 评论区 */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">评论 ({comments.length})</h3>
          
          {/* 排序切换 */}
          <div className="flex gap-2 text-sm">
            <button 
              onClick={() => setSortOrder('hot')}
              className={`px-3 py-1 rounded-full transition-colors ${sortOrder === 'hot' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              最热
            </button>
            <button 
              onClick={() => setSortOrder('new')}
              className={`px-3 py-1 rounded-full transition-colors ${sortOrder === 'new' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              最新
            </button>
          </div>
        </div>

        {/* 写评论 */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none bg-white"
              placeholder="写下你的想法..."
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm">
                发布评论
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-6 bg-white rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 mb-2">登录后参与评论</p>
            <button 
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              去登录
            </button>
          </div>
        )}

        {/* 评论列表 */}
        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onDelete={handleDeleteComment}
              onLike={handleLikeComment}
              onReply={handleReplyComment}
              currentUser={user}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无评论，快来抢沙发吧！</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

// --- 子组件：单条评论 (支持回复和点赞) ---
function CommentItem({ comment, onDelete, onLike, onReply, currentUser }: { 
  comment: Comment, 
  onDelete: (id: number) => void, 
  onLike: (id: number) => void,
  onReply: (parentId: number, content: string) => void,
  currentUser: any
}) {
  const router = useRouter();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // 处理提交回复
  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  return (
    <div className="flex gap-4 group">
      <div 
        className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push(`/user/${comment.author.username}`)}
      >
        <img 
          src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comment.author.username)}`} 
          alt={comment.author.username}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-gray-900">{comment.author.nickname || comment.author.username}</span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 mb-3">{comment.content}</p>
          
          {/* 底部操作栏 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button 
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 transition-colors group/btn ${comment.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <svg 
                className={`w-4 h-4 transition-colors ${comment.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`}
                fill={comment.isLiked ? "currentColor" : "none"}
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{comment.likeCount || 0}</span>
            </button>
            
            {currentUser && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="hover:text-yellow-600 transition-colors"
              >
                回复
              </button>
            )}

            {/* 仅显示给评论作者或管理员 */}
            {currentUser && currentUser.id === comment.author.id && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
              >
                删除
              </button>
            )}
          </div>
        </div>

        {/* 回复输入框 */}
        {isReplying && (
          <div className="mt-3 ml-2 animate-fade-in-down">
            <input 
              type="text" 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`回复 @${comment.author.nickname || comment.author.username}...`}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:border-yellow-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsReplying(false)} className="text-xs text-gray-500">取消</button>
              <button 
                onClick={handleSubmitReply}
                className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                发送
              </button>
            </div>
          </div>
        )}

        {/* 显示子评论 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg group/reply">
                 <div className="w-8 h-8 rounded-full overflow-hidden relative border border-gray-200 flex-shrink-0">
                    <img 
                        src={reply.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(reply.author.username)}`} 
                        alt={reply.author.username}
                        className="w-full h-full object-cover"
                    />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{reply.author.nickname || reply.author.username}</span>
                        <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                      </div>
                      {currentUser && currentUser.id === reply.author.id && (
                        <button 
                          onClick={() => onDelete(reply.id)}
                          className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
