'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('posts');

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop"
                    alt="Paris"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">巴黎浪漫之旅：三天两夜攻略</h3>
                  <p className="text-sm text-gray-500">发布于 2023-10-15 • 1.2k 阅读</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>❤️ 128</span>
                <span>💬 32</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1533929736472-594e69d8cf60?w=100&h=100&fit=crop"
                    alt="Kyoto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">京都红叶季：寻找最美秋色</h3>
                  <p className="text-sm text-gray-500">发布于 2023-09-20 • 856 阅读</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>❤️ 95</span>
                <span>💬 18</span>
              </div>
            </div>
          </div>
        );
      case 'favorites':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&h=100&fit=crop"
                    alt="Swiss"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">瑞士阿尔卑斯山徒步指南</h3>
                  <p className="text-sm text-gray-500">收藏于 2023-10-20</p>
                </div>
              </div>
              <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">取消收藏</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop"
                    alt="Beach"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">马尔代夫选岛全攻略</h3>
                  <p className="text-sm text-gray-500">收藏于 2023-10-18</p>
                </div>
              </div>
              <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">取消收藏</button>
            </div>
          </div>
        );
      case 'ai-history':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer border border-transparent hover:border-yellow-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">制定日本7日游行程</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">2023-10-22</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                我想去东京、京都和大阪，请帮我规划一个合理的行程路线，包括交通建议和必去景点...
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer border border-transparent hover:border-yellow-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">欧洲签证办理咨询</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">2023-10-15</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                请问办理申根签证需要准备哪些材料？如果是自由职业者，需要提供什么额外的证明文件？...
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer border border-transparent hover:border-yellow-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">推荐适合独自旅行的海岛</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">2023-09-30</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                我想找一个安全、风景好、适合一个人发呆的海岛，预算在1万元左右，有什么推荐吗？...
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">基本信息</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                  <input
                    type="text"
                    defaultValue="旅行达人"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <textarea
                    rows={3}
                    defaultValue="热爱旅行的自由职业者，足迹遍布五大洲。喜欢分享旅行中的美好瞬间和实用攻略。"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input
                    type="email"
                    defaultValue="traveler@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">账号安全</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800">修改密码</p>
                  <p className="text-sm text-gray-500">定期修改密码可以保护账号安全</p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-700 font-medium">修改</button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800">绑定手机</p>
                  <p className="text-sm text-gray-500">已绑定：138****8888</p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-700 font-medium">更换</button>
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                保存修改
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden min-h-[500px]">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  我的游记
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'favorites'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  收藏夹
                </button>
                <button
                  onClick={() => setActiveTab('ai-history')}
                  className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'ai-history'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  AI 对话记录
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  设置
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}