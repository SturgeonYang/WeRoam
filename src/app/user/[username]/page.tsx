'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import TravelPosts from '@/components/TravelPosts';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowed: boolean;
}

import UserListModal from '@/components/UserListModal';

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, refreshUser } = useAuth();

  // Modal states
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setUsername(resolvedParams.username);
    });
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch(`/api/users/${username}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        } else {
          setProfile(null);
        }

        // Fetch user posts
        const postsRes = await fetch(`/api/users/${username}/posts`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const { isFollowed } = await res.json();
        setProfile(prev => prev ? {
          ...prev,
          isFollowed,
          followersCount: isFollowed ? prev.followersCount + 1 : prev.followersCount - 1
        } : null);
        refreshUser(); // Update current user's stats
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const fetchUserList = async (type: 'followers' | 'following') => {
    if (!username) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/users/${username}/${type}`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">用户不存在</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-6">
                <div className="relative">
                  <img 
                    src={profile.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'} 
                    alt={profile.nickname || profile.username}
                    className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover"
                  />
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.nickname || profile.username}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>
              
              {currentUser && currentUser.id !== profile.id && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    profile.isFollowed
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {profile.isFollowed ? '已关注' : '关注'}
                </button>
              )}
            </div>

            <div className="flex gap-8 border-t border-gray-100 pt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{profile.postsCount}</div>
                <div className="text-sm text-gray-500">游记</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={openFollowers}
              >
                <div className="text-xl font-bold text-gray-900">{profile.followersCount}</div>
                <div className="text-sm text-gray-500">粉丝</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={openFollowing}
              >
                <div className="text-xl font-bold text-gray-900">{profile.followingCount}</div>
                <div className="text-sm text-gray-500">关注</div>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 text-gray-700">
                {profile.bio}
              </div>
            )}
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">发布的游记</h2>
          <TravelPosts posts={posts} />
        </div>
      </div>

      {/* Modals */}
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
