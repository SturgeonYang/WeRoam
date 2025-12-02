//// filepath: d:\weroam\WeRoam\src\app\community\CommunityList.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

// 定义接口
interface Post {
  id: number;
  title: string;
  content: string | null;
  coverImage: string | null;
  location: string | null;
  likeCount: number;
  tags: string[];
  createdAt?: string | Date; // 防止没有时出错
  author: {
    id?: number;
    nickname: string | null;
    avatar: string | null;
    username?: string | null;
  };
}

interface CommunityListProps {
  initialPosts: Post[];
}

// 标签颜色
const TAG_COLORS = [
  'bg-red-100 text-red-600',
  'bg-orange-100 text-orange-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-teal-100 text-teal-600',
];

const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

export default function CommunityList({ initialPosts }: CommunityListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // 排序
  const [sortType, setSortType] = useState<'latest' | 'hottest'>('latest');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [initialPosts]);

  // 过滤 + 排序
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = initialPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });

    // 排序：最新 / 最热（按 likeCount）
    return [...filtered].sort((a, b) => {
      if (sortType === 'hottest') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      // latest：按 createdAt，缺少时维持原顺序
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [initialPosts, searchTerm, selectedTag, sortType]);

  const handleLike = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) newLiked.delete(postId);
    else newLiked.add(postId);
    setLikedPosts(newLiked);
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('转发功能开发中：已复制链接到剪贴板！');
  };

  const handleAvatarClick = (e: React.MouseEvent, authorId: number | undefined) => {
    e.stopPropagation();
    if (authorId) {
      alert(`进入与用户的私聊界面 (ID: ${authorId})`);
    }
  };

  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`);
  };

  if (initialPosts.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂时没有游记，快去发布第一篇吧！</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* 左侧侧边栏 */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
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

        {/* 热门标签 */}
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
            {allTags.map((tag) => {
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

        {/* 攻略群入口：改为跳转新页面 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💬</span> 攻略群
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            寻找一起出行的旅伴，加入目的地攻略群，获取一手经验。
          </p>
          <button
            onClick={() => router.push('/community/groups')}
            className="w-full px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold shadow transition"
          >
            查看攻略群
          </button>
        </div>
      </aside>

      {/* 右侧内容：只保留“全部游记 + 排序 + 列表”，不再有 showGroups 判断 */}
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedTag ? (
              <span className="flex items-center gap-2">
                筛选:
                <span className={`px-2 py-0.5 rounded text-base ${getTagColor(selectedTag)}`}>
                  #{selectedTag}
                </span>
              </span>
            ) : (
              '全部游记'
            )}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredAndSortedPosts.length} 篇)
            </span>
          </h2>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">排序：</span>
            <button
              type="button"
              onClick={() => setSortType('latest')}
              className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${
                sortType === 'latest'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              最新
            </button>
            <button
              type="button"
              onClick={() => setSortType('hottest')}
              className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${
                sortType === 'hottest'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              最热
            </button>
          </div>
        </div>

        {/* 游记列表保持原来的实现 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.id)}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-yellow-100/50 flex flex-col h-full cursor-pointer"
              >
                {/* 封面 */}
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      暂无图片
                    </div>
                  )}
                  {post.location && (
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span>📍</span> {post.location}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                    {post.tags.slice(0, 3).map((tag) => (
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

                  <div className="flex items-center justify-between pt-4 border-top border-gray-50 mt-auto">
                    <div
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                    >
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          className="w-6 h-6 rounded-full border border-gray-100"
                          alt=""
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      <span className="text-xs text-gray-600 font-medium">
                        {post.author.nickname || post.author.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleForward}
                        className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-xs group/btn"
                        title="转发"
                      >
                        <span className="transform group-hover/btn:rotate-12 transition-transform">
                          ↗️
                        </span>
                      </button>

                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <span
                          className={`transform transition-transform ${
                            isLiked ? 'scale-110' : ''
                          }`}
                        >
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

        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-20 bg白 rounded-xl border border-dashed border-gray-300 mt-6">
            <p className="text-gray-500">没有找到相关游记</p>
          </div>
        )}
      </main>
    </div>
  );
}