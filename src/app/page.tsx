import Navbar from '@/components/Navbar';
import AIChat from '@/components/AIChat';
import TravelPosts from '@/components/TravelPosts';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              云旅札记
              <span className="block text-2xl sm:text-3xl text-yellow-600 font-normal mt-2">
                WeRoam - AI 驱动的智能旅行规划助手
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              通过AI对话获得个性化旅游建议，分享和发现精彩的旅行经验
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* AI Chat Section */}
            <div className="lg:sticky lg:top-24">
              <AIChat />
            </div>

            {/* Travel Posts Section */}
            <div>
              <TravelPosts />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-yellow-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>© 2024 云旅札记 (WeRoam). 让AI成为您的贴心旅行顾问</p>
          </div>
        </div>
      </footer>
    </div>
  );
}