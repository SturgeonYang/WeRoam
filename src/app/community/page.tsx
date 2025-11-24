import Navbar from '@/components/Navbar';
import TravelPosts from '@/components/TravelPosts';
import Link from 'next/link';

export default function Community() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Community Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            旅行社区
          </h1>
          <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
            分享您的旅行故事，发现更多精彩的目的地
          </p>
        </div>
      </div>

      {/* Community Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter and Sort Options */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-medium">
                  全部
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-yellow-100">
                  国内游
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-yellow-100">
                  出境游
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-yellow-100">
                  海岛度假
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-yellow-100">
                  城市探索
                </button>
              </div>
              
              <Link href="/create-post">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  发布游记
                </button>
              </Link>
            </div>
          </div>

          {/* Posts */}
          <TravelPosts />

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50 px-8 py-3 rounded-full font-medium transition-colors">
              加载更多
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}