'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    nickname: string | null;
    username: string | null;
    avatar: string | null;
  };
}

interface PostDetailProps {
  post: {
    id: number; // <--- 改回 number
    title: string;
    content: string | null;
    coverImage: string | null;
    location: string | null;
    likeCount: number;
    tags: string[]; // 假设传入的是解析后的数组
    createdAt: Date;
    author: {
      id: number; // <--- 改回 number
      nickname: string | null;
      username: string | null;
      avatar: string | null;
      bio: string | null;
    };
    comments: Comment[];
  };
  currentUser?: any; // 当前登录用户，可选
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // 模拟添加评论 (实际项目中应调用 API)
    const mockComment: Comment = {
      id: Date.now(),
      content: newComment,
      createdAt: new Date(),
      author: {
        nickname: '我',
        username: 'me',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
      },
    };

    setComments([mockComment, ...comments]);
    setNewComment('');
  };

  const handleAvatarClick = (userId: number) => { // <--- 改回 number
    alert(`跳转到用户 (ID: ${userId}) 的私聊界面`);
    // router.push(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          ← 返回
        </button>
        <span className="font-bold text-gray-700">游记详情</span>
      </div>

      <div className="max-w-4xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 封面图 */}
            {post.coverImage && (
              <div className="relative h-64 md:h-96 bg-gray-100">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
                {post.location && (
                  <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    📍 {post.location}
                  </div>
                )}
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* 标题和发布时间 */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* 正文 */}
              <div className="prose prose-yellow max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

              {/* 底部交互栏 */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={isLiked ? 'scale-110' : ''}>{isLiked ? '❤️' : '🤍'}</span>
                    <span className="font-medium">{likes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                    💬 <span className="font-medium">{comments.length}</span>
                  </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  🔗 分享
                </button>
              </div>
            </div>
          </article>

          {/* 评论区 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">评论 ({comments.length})</h3>
            
            {/* 发送评论框 */}
            <form onSubmit={handleSubmitComment} className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" alt="Me" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的评论..."
                  className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-yellow-400 focus:bg-white focus:ring-0 transition-all resize-none h-24"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    发送评论
                  </button>
                </div>
              </div>
            </form>

            {/* 评论列表 */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => handleAvatarClick(0)} // 这里简化处理，实际应传ID
                  >
                    {comment.author.avatar && <img src={comment.author.avatar} alt="" />}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-sm text-gray-800">{comment.author.nickname}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center text-gray-400 py-4">暂无评论，快来抢沙发吧！</div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：作者信息 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-20 h-20 rounded-full border-4 border-yellow-100 overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleAvatarClick(post.author.id)}
              >
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.nickname || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{post.author.nickname}</h3>
              <p className="text-sm text-gray-500 mb-4">@{post.author.username}</p>
              <p className="text-gray-600 text-sm mb-6 italic">"{post.author.bio || '这个作者很懒，什么都没写'}"</p>
              
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => handleAvatarClick(post.author.id)}
                  className="flex-1 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl transition-colors"
                >
                  私聊
                </button>
                <button className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors">
                  关注
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}