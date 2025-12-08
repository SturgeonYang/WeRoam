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

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // 状态管理
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [sortOrder, setSortOrder] = useState<'hot' | 'new'>('hot');
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 排序逻辑 ---
  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === 'hot') {
      return b.likeCount - a.likeCount; // 热度：点赞多的在前
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 时间：新的在前
    }
  });

  // --- 交互处理函数 ---

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

      setComments(comments.map(c => 
        c.id === commentId ? { 
          ...c, 
          likeCount: liked ? c.likeCount + 1 : c.likeCount - 1 
        } : c
      ));
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
              className="hover:text-red-500 flex items-center gap-1 transition-colors group/btn"
            >
              <svg 
                className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" 
                fill="none" 
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
