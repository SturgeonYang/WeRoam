interface Post {
  id: number;
  title: string;
  author: string;
  avatar: string;
  location: string;
  date: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  tags: string[];
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
  {
    id: 2,
    title: "新疆喀纳斯湖的秋日童话",
    author: "山水行者",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=faces",
    location: "新疆喀纳斯",
    date: "2024-09-20",
    content: "九月的喀纳斯湖美得像一幅画，湖水呈现出深邃的蓝绿色，周围的白桦林已经开始变黄。强烈推荐住在景区内的小木屋，可以看到最美的日出。",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"],
    likes: 89,
    comments: 15,
    tags: ["新疆", "湖泊", "秋景"]
  },
  {
    id: 3,
    title: "泰国普吉岛海岛度假指南",
    author: "海岛达人",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=faces",
    location: "泰国普吉岛",
    date: "2024-03-10",
    content: "普吉岛的海水清澈见底，沙滩细腻柔软。推荐入住卡塔海滩附近的酒店，性价比很高。一定要体验一次日落帆船之旅，非常浪漫！",
    images: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop"],
    likes: 156,
    comments: 31,
    tags: ["泰国", "海岛", "度假"]
  }
];

export default function TravelPosts() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">热门旅游经验</h2>
      
      {mockPosts.map((post) => (
        <div key={post.id} className="post-card bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full bg-yellow-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{post.author}</h3>
                  <p className="text-sm text-gray-500">{post.location} · {post.date}</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
            <p className="text-gray-600 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Images */}
          {post.images.length > 0 && (
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
              
              <button className="text-gray-500 hover:text-yellow-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}