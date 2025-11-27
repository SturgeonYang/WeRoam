'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// 定义接口
interface Post {
  id: number; // <--- 改回 number
  title: string;
  content: string | null;
  coverImage: string | null;
  location: string | null;
  likeCount: number;
  tags: string[];
  author: {
    id?: number; // <--- 改回 number
    nickname: string | null;
    avatar: string | null;
    username?: string | null;
  };
}

interface CommunityListProps {
  initialPosts: Post[];
}

// 1. 定义一组好看的标签颜色样式
const TAG_COLORS = [
  'bg-red-100 text-red-600',
  'bg-orange-100 text-orange-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-teal-100 text-teal-600',
];

// 2. 辅助函数：根据标签名获取固定的颜色（保证同一个标签颜色总是相同的）
const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

// --- 新增：发布游记模态框组件 ---
const PublishModal = ({ isOpen, onClose, allTags }: { isOpen: boolean; onClose: () => void; allTags: string[] }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleAutoLocate = () => {
    setIsLocating(true);
    // 模拟定位延迟
    setTimeout(() => {
      setLocation('上海市 · 外滩');
      setIsLocating(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">发布新游记</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input type="text" placeholder="给你的游记起个吸引人的标题..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea rows={4} placeholder="分享你的旅行故事..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none resize-none" />
          </div>

          {/* 标签选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择标签 (最多3个)</label>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag) 
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* IP定位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在位置</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="添加地点..." 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none" 
              />
              <button 
                onClick={handleAutoLocate}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                {isLocating ? '定位中...' : '📍 获取定位'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">取消</button>
          <button onClick={onClose} className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-lg shadow-md transition-colors">发布</button>
        </div>
      </div>
    </div>
  );
};

export default function CommunityList({ initialPosts }: CommunityListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  
  // 模拟本地点赞状态
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set()); // <--- 改回 number

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [initialPosts]);

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleLike = (e: React.MouseEvent, postId: number) => { // <--- 改回 number
    e.stopPropagation(); // 防止触发卡片点击
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('转发功能开发中：已复制链接到剪贴板！');
  };

  const handleAvatarClick = (e: React.MouseEvent, authorId: number | undefined) => { // <--- 改回 number
    e.stopPropagation();
    // 假设私聊路由是 /chat/[userId]
    if (authorId) {
      console.log(`Navigating to chat with user ${authorId}`);
      // router.push(`/chat/${authorId}`); 
      alert(`进入与用户的私聊界面 (ID: ${authorId})`);
    }
  };

  const handlePostClick = (postId: number) => { // <--- 改回 number
    console.log(`Navigating to post ${postId}`);
    router.push(`/community/${postId}`);
  };
  
  if (initialPosts.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂时没有游记，快去发布第一篇吧！</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* 发布模态框 */}
      <PublishModal 
        isOpen={isPublishOpen} 
        onClose={() => setIsPublishOpen(false)} 
        allTags={allTags}
      />

      {/* 左侧侧边栏 */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        {/* 发布按钮 */}
        <button 
          onClick={() => setIsPublishOpen(true)}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>✍️</span> 发布游记
        </button>

        {/* 搜索框 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🔍</span> 搜索游记
          </h3>
          <input
            type="text"
            placeholder="输入关键词..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 标签云 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>🏷️</span> 热门标签
            </h3>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag(null)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                清除
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const colorClass = getTagColor(tag);
              const isSelected = selectedTag === tag;
              
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium ${
                    isSelected 
                      ? 'bg-gray-800 text-white shadow-md scale-105' 
                      : `${colorClass} hover:brightness-95`
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 右侧内容 */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedTag ? (
              <span className="flex items-center gap-2">
                筛选: <span className={`px-2 py-0.5 rounded text-base ${getTagColor(selectedTag)}`}>#{selectedTag}</span>
              </span>
            ) : '全部游记'} 
            <span className="text-sm font-normal text-gray-500 ml-2">({filteredPosts.length} 篇)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            
            return (
              <div 
                key={post.id} 
                onClick={() => handlePostClick(post.id)}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-yellow-100/50 flex flex-col h-full cursor-pointer"
              >
                {/* 封面图 */}
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">暂无图片</div>
                  )}
                  
                  {/* 地点标签 (如果有) */}
                  {post.location && (
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span>📍</span> {post.location}
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                    {post.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    {/* 作者信息 - 点击进入私聊 */}
                    <div 
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                    >
                      {post.author.avatar ? (
                        <img src={post.author.avatar} className="w-6 h-6 rounded-full border border-gray-100" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      <span className="text-xs text-gray-600 font-medium">
                        {post.author.nickname || post.author.username}
                      </span>
                    </div>

                    {/* 交互按钮组 */}
                    <div className="flex items-center gap-3">
                      {/* 转发 */}
                      <button 
                        onClick={handleForward}
                        className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-xs group/btn"
                        title="转发"
                      >
                        <span className="transform group-hover/btn:rotate-12 transition-transform">↗️</span>
                      </button>

                      {/* 点赞 */}
                      <button 
                        onClick={(e) => handleLike(e, post.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      >
                        <span className={`transform transition-transform ${isLiked ? 'scale-110' : ''}`}>
                          {isLiked ? '❤️' : '🤍'}
                        </span>
                        <span>{post.likeCount + (isLiked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredPosts.length === 0 && (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-500">没有找到相关游记</p>
           </div>
        )}
      </main>
    </div>
  );
}