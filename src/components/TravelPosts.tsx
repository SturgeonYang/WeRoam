'use client';

import { useRouter } from 'next/navigation';

export interface Post {
  id: number;
  title: string;
  author: string | { nickname: string | null; username: string; avatar: string | null };
  avatar?: string; // Keep for backward compatibility if needed, but prefer author object
  location: string | null;
  date?: string;
  createdAt?: string;
  content: string;
  images: string[];
  likes?: number;
  likeCount?: number;
  comments?: number;
  commentCount?: number;
  tags: string[];
  isLiked?: boolean;
  isFavorited?: boolean;
}

interface TravelPostsProps {
  posts?: Post[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: "京都赏樱三日游完美攻略",
    author: "樱花小姐",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=faces",
    location: "日本京都",
    date: "2024-04-15",
    content: "春天的京都真的太美了！清水寺的樱花盛开，哲学之道的樱花隧道让人流连忘返。推荐大家早上8点前到达清水寺，避开人群，拍照效果最佳。",
    images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop", "https://images.unsplash.com/photo-1528164344705-47542687000d?w=300&h=200&fit=crop"],
    likes: 128,
    comments: 23,
    tags: ["日本", "樱花", "古建筑"]
  },
  // ... other mock posts
];

export default function TravelPosts({ posts = mockPosts }: TravelPostsProps) {
  const router = useRouter();

  const handleLike = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        router.refresh();
        // Ideally we should update local state here for instant feedback
        // but router.refresh() works for now if the parent re-fetches
        window.location.reload(); // Force reload to see changes since router.refresh might not be enough for client-side fetched data
      } else if (res.status === 401) {
        alert('请先登录');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFavorite = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/posts/${postId}/favorite`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else if (res.status === 401) {
        alert('请先登录');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error favoriting post:', error);
    }
  };

  const handleForward = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    const url = `${window.location.origin}/community/${postId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('链接已复制到剪贴板！');
      }).catch((err) => {
        console.error('Clipboard write failed:', err);
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) alert('链接已复制到剪贴板！');
      else alert('复制失败，请手动复制链接');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('复制失败，请手动复制链接');
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {posts === mockPosts ? "热门旅游经验" : "游记列表"}
      </h2>
      
      {posts.map((post) => {
        // Normalize data
        const authorName = typeof post.author === 'string' ? post.author : (post.author.nickname || post.author.username);
        const authorAvatar = typeof post.author === 'string' ? post.avatar : post.author.avatar;
        const authorUsername = typeof post.author === 'string' ? null : post.author.username;
        const displayDate = post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '');
        const likeCount = post.likes ?? post.likeCount ?? 0;
        const commentCount = post.comments ?? post.commentCount ?? 0;

        return (
        <div key={post.id} className="post-card bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div 
                className={`flex items-center space-x-3 ${authorUsername ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => authorUsername && router.push(`/user/${authorUsername}`)}
              >
                <img
                  src={authorAvatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                  alt={authorName}
                  className="w-10 h-10 rounded-full bg-yellow-200 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{authorName}</h3>
                  <p className="text-sm text-gray-500">{post.location} · {displayDate}</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
            <p className="text-gray-600 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="px-6 pb-4">
              <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${post.title} - ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl bg-yellow-100"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Post Tags */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-6">
              {/* 1. Share */}
              <button
                onClick={(e) => handleForward(e, post.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors group/btn"
                title="分享"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="hidden sm:inline">分享</span>
              </button>

              {/* 2. Like */}
              <button 
                onClick={(e) => handleLike(e, post.id)}
                className={`flex items-center gap-1 text-xs transition-colors group/btn`}
              >
                <svg 
                  className={`w-4 h-4 transition-all ${post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'fill-none text-gray-400 group-hover/btn:text-red-500'}`} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className={`${post.isLiked ? 'text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`}>
                  {likeCount}
                </span>
              </button>
              
              {/* 3. Comment */}
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors group/btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{commentCount}</span>
              </button>

              {/* 4. Favorite */}
              <button 
                onClick={(e) => handleFavorite(e, post.id)}
                className={`flex items-center gap-1 text-xs group/btn transition-colors`}
                title="收藏"
              >
                <svg 
                  className={`w-4 h-4 transition-colors ${post.isFavorited ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-gray-400 group-hover/btn:text-yellow-500'}`} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className={`${post.isFavorited ? 'text-yellow-500' : 'text-gray-400 group-hover/btn:text-yellow-500'}`}>
                  {post.isFavorited ? '已收藏' : '收藏'}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
}