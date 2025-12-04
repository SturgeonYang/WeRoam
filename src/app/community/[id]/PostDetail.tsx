'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 定义评论接口
interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  likeCount: number;
  author: {
    id: number;
    username: string;
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
    author: {
      id: number;
      username: string;
      nickname?: string | null;
      avatar?: string | null;
    };
    comments: Comment[];
  };
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  
  // 状态管理
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [sortOrder, setSortOrder] = useState<'hot' | 'new'>('hot');

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
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now(), // 临时 ID
      content: newComment,
      createdAt: new Date(),
      likeCount: 0,
      author: {
        id: 999, // 假设当前用户 ID
        username: 'me',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
      },
      replies: [],
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  // 2. 删除评论
  const handleDeleteComment = (commentId: number) => {
    if (confirm('确定要删除这条评论吗？')) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  // 3. 点赞评论
  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likeCount: c.likeCount + 1 } : c
    ));
  };

  // 4. 新增：回复评论的处理函数
  const handleReplyComment = (parentId: number, content: string) => {
    const newReply: Comment = {
      id: Date.now(),
      content,
      createdAt: new Date(),
      likeCount: 0,
      author: {
        id: 999, // 模拟当前用户
        username: 'me',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
      },
      parentId,
    };

    // 找到对应的父评论，把新回复加进去
    setComments(comments.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen shadow-sm">
      {/* 返回按钮 */}
      <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-blue-600 flex items-center gap-2">
        ← 返回列表
      </button>

      {/* 文章头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-6">
          <div className="flex items-center gap-3">
            <img 
              src={post.author.avatar || 'https://via.placeholder.com/40'} 
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <p className="font-medium text-gray-900">{post.author.nickname || post.author.username}</p>
              <p>{post.location || '未知地点'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/喜欢_like (1).svg"
                alt="喜欢"
                className="w-4 h-4"
              />
              <span>{post.likeCount} 喜欢</span>
            </span>
            <span className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/评论_comments.svg"
                alt="评论"
                className="w-4 h-4"
              />
              <span>{comments.length} 评论</span>
            </span>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="prose max-w-none mb-12">
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full h-96 object-cover rounded-xl mb-8 shadow-md" />
        )}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{post.content}</p>
        
        {/* 标签 */}
        <div className="mt-8 flex gap-2">
          {post.tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
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
              className={`px-3 py-1 rounded-full ${sortOrder === 'hot' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              最热
            </button>
            <button 
              onClick={() => setSortOrder('new')}
              className={`px-3 py-1 rounded-full ${sortOrder === 'new' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              最新
            </button>
          </div>
        </div>

        {/* 写评论 */}
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
            placeholder="写下你的想法..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              发布评论
            </button>
          </div>
        </form>

        {/* 评论列表 */}
        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onDelete={handleDeleteComment}
              onLike={handleLikeComment}
              onReply={handleReplyComment} // <--- 记得把函数传下去
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无评论，快来抢沙发吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 子组件：单条评论 (支持回复和点赞) ---
function CommentItem({ comment, onDelete, onLike, onReply }: { 
  comment: Comment, 
  onDelete: (id: number) => void, 
  onLike: (id: number) => void,
  onReply: (parentId: number, content: string) => void // <--- 新增类型定义
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState(''); // <--- 新增状态：记录回复内容

  // 处理提交回复
  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent); // 调用父组件函数
    setIsReplying(false); // 关闭输入框
    setReplyContent(''); // 清空内容
  };

  return (
    <div className="flex gap-4 group">
      <img 
        src={comment.author.avatar || 'https://via.placeholder.com/40'} 
        alt={comment.author.username}
        className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-gray-900">{comment.author.username}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-3">{comment.content}</p>
          
          {/* 底部操作栏 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button 
              onClick={() => onLike(comment.id)}
              className="hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <span>👍</span> {comment.likeCount || 0}
            </button>
            
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-blue-600 transition-colors"
            >
              回复
            </button>

            <button 
              onClick={() => onDelete(comment.id)}
              className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
            >
              删除
            </button>
          </div>
        </div>

        {/* 回复输入框 (点击回复后显示) */}
        {isReplying && (
          <div className="mt-3 ml-2 animate-fade-in-down">
            <input 
              type="text" 
              value={replyContent} // <--- 绑定 value
              onChange={(e) => setReplyContent(e.target.value)} // <--- 绑定 onChange
              placeholder={`回复 @${comment.author.username}...`}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsReplying(false)} className="text-xs text-gray-500">取消</button>
              <button 
                onClick={handleSubmitReply} // <--- 绑定点击事件
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                发送
              </button>
            </div>
          </div>
        )}

        {/* 新增：显示子评论 (回复列表) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                 <img 
                    src={reply.author.avatar || 'https://via.placeholder.com/30'} 
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                 />
                 <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800">{reply.author.username}</span>
                      <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}