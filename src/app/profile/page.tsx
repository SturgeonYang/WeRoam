import Navbar from '@/components/Navbar';

export default function Profile() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            
            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end justify-between -mt-16">
                <div className="flex items-end space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&crop=faces"
                    alt="用户头像"
                    className="w-24 h-24 rounded-full border-4 border-white bg-yellow-200"
                  />
                  <div className="pb-2">
                    <h1 className="text-2xl font-bold text-gray-800">旅行达人</h1>
                    <p className="text-gray-600">@travel_expert</p>
                  </div>
                </div>
                
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  编辑资料
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700 mb-4">
                  热爱旅行的自由职业者，足迹遍布五大洲。喜欢分享旅行中的美好瞬间和实用攻略。
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>📍 北京</span>
                  <span>✈️ 已访问 28 个国家</span>
                  <span>📅 加入于 2023年6月</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">15</div>
              <div className="text-gray-600">发布游记</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">1.2k</div>
              <div className="text-gray-600">获得点赞</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">328</div>
              <div className="text-gray-600">粉丝数量</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">156</div>
              <div className="text-gray-600">关注用户</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button className="py-4 px-1 border-b-2 border-yellow-500 text-yellow-600 font-medium">
                  我的游记
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  收藏夹
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  AI 对话记录
                </button>
                <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  设置
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* My Posts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=60&h=60&fit=crop"
                      alt="游记封面"
                      className="w-15 h-15 rounded-lg object-cover bg-yellow-200"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">京都赏樱三日游完美攻略</h3>
                      <p className="text-sm text-gray-600">2024年4月15日 · 128 赞 · 23 评论</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop"
                      alt="游记封面"
                      className="w-15 h-15 rounded-lg object-cover bg-yellow-200"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">新疆喀纳斯湖的秋日童话</h3>
                      <p className="text-sm text-gray-600">2024年3月20日 · 89 赞 · 15 评论</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}