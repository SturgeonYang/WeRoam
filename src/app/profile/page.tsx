'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditProfileModal from '@/components/EditProfileModal';
import UserListModal from '@/components/UserListModal';

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Modal states
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchUserList = async (type: 'followers' | 'following') => {
    if (!user?.username) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/users/${user.username}/${type}`);
      if (res.ok) {
        const data = await res.json();
        setUserList(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoadingList(false);
    }
  };

  const openFollowers = () => {
    setShowFollowers(true);
    fetchUserList('followers');
  };

  const openFollowing = () => {
    setShowFollowing(true);
    fetchUserList('following');
  };

  const handleUnfavorite = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    // if (!confirm('确定要取消收藏吗？')) return; // Optional: add confirmation

    try {
      const res = await fetch(`/api/posts/${postId}/favorite`, { method: 'POST' });
      if (res.ok) {
        setFavorites(prev => prev.filter(p => p.id !== postId));
        refreshUser(); // Update counts
      }
    } catch (error) {
      console.error('Error unfavoriting:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (activeTab === 'posts' && user) {
      setLoadingPosts(true);
      fetch('/api/my-posts')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPosts(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingPosts(false));
    } else if (activeTab === 'favorites' && user) {
      setLoadingFavorites(true);
      fetch('/api/my-favorites')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavorites(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingFavorites(false));
    } else if (activeTab === 'ai-history' && user) {
      setLoadingSessions(true);
      fetch('/api/chat/sessions')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setChatSessions(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingSessions(false));
    }
  }, [activeTab, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loadingPosts) {
          return <div className="text-center py-12 text-gray-500">加载中...</div>;
        }
        if (posts.length === 0) {
          return (
            <div className="space-y-4">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>您还没有发布任何游记</p>
                <button 
                  onClick={() => router.push('/create-post')}
                  className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  去发布第一篇游记 &rarr;
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => router.push(`/community/${post.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 bg-gray-100">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage.startsWith('http') || post.coverImage.startsWith('/') ? post.coverImage : `/${post.coverImage}`}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.commentCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'favorites':
        if (loadingFavorites) {
          return <div className="text-center py-12 text-gray-500">加载中...</div>;
        }
        if (favorites.length === 0) {
          return (
            <div className="space-y-4">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>暂无收藏内容</p>
                <button 
                  onClick={() => router.push('/community')}
                  className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  去社区逛逛 &rarr;
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((post) => (
              <div 
                key={post.id} 
                onClick={() => router.push(`/community/${post.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 bg-gray-100">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage.startsWith('http') || post.coverImage.startsWith('/') ? post.coverImage : `/${post.coverImage}`}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden relative border border-gray-200">
                        <img 
                          src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author.username)}`} 
                          alt={post.author.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{post.author.nickname || post.author.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likeCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.commentCount || 0}
                      </span>
                      <button
                        onClick={(e) => handleUnfavorite(e, post.id)}
                        className="flex items-center gap-1 text-xs group/btn transition-colors text-yellow-500 hover:text-gray-400"
                        title="取消收藏"
                      >
                        <svg 
                          className="w-4 h-4 fill-yellow-500 transition-colors group-hover/btn:fill-none group-hover/btn:text-gray-400" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'ai-history':
        if (loadingSessions) {
          return <div className="text-center py-12 text-gray-500">加载中...</div>;
        }
        if (chatSessions.length === 0) {
          return (
            <div className="space-y-4">
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>暂无对话记录</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {chatSessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{session.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(session.updatedAt).toLocaleString()} · {session._count?.messages || 0} 条消息
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push(`/?chatSessionId=${session.id}`)}
                    className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-r from-yellow-200 to-orange-100"></div>
          
          <div className="relative flex flex-col sm:flex-row items-end sm:items-center pt-16 sm:pt-12">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`}
                  alt={user.username}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.nickname || user.username}</h1>
                  <p className="text-gray-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location || '未知地点'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  编辑资料
                </button>
              </div>
              
              <p className="mt-4 text-gray-600 max-w-2xl">
                {user.bio || '这个人很懒，什么都没有写...'}
              </p>
              
              <div className="flex items-center space-x-8 mt-6 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user._count?.posts ?? 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">游记</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user._count?.favorites ?? 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">收藏</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={openFollowing}
                >
                  <div className="text-2xl font-bold text-gray-900">{user._count?.following ?? 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">关注</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={openFollowers}
                >
                  <div className="text-2xl font-bold text-gray-900">{user._count?.followedBy ?? 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">粉丝</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我的游记
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                我的收藏
              </button>
              <button
                onClick={() => setActiveTab('ai-history')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'ai-history'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                AI 对话记录
              </button>
            </nav>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
      <UserListModal 
        isOpen={showFollowers} 
        onClose={() => setShowFollowers(false)} 
        title="粉丝列表" 
        users={userList} 
        loading={loadingList} 
      />
      <UserListModal 
        isOpen={showFollowing} 
        onClose={() => setShowFollowing(false)} 
        title="关注列表" 
        users={userList} 
        loading={loadingList} 
      />
    </div>
  );
}
