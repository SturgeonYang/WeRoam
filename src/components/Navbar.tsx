'use client'; // 1. 必须标记为客户端组件

import Link from 'next/link';
import Image from 'next/image'; // 1. 引入 Image 组件
import { usePathname } from 'next/navigation'; // 2. 引入钩子

export default function Navbar() {
  const pathname = usePathname(); // 3. 获取当前路径，例如 "/community"

  // 定义一个辅助函数，用来判断链接是否激活
  const isActive = (path: string) => {
    return pathname === path ? 'text-yellow-500 font-bold' : 'text-gray-600 hover:text-yellow-500';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo 区域 */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              {/* 2. 替换 Emoji 为图片 */}
              <div className="relative w-10 h-10 hover:scale-110 transition-transform duration-200">
                <Image 
                  src="/logo.png" 
                  alt="WeRoam Logo" 
                  fill // 让图片填满父容器
                  className="object-contain" // 保持图片比例
                  priority // 优先加载 Logo
                />
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">WeRoam</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <Link
              href="/"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive('/')}`}
            >
              首页
            </Link>

            <Link
              href="/community"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive('/community')}`}
            >
              社区
            </Link>

            <Link
              href="/about"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive('/about')}`}
            >
              关于我们
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}