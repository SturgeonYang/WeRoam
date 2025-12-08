'use client'; // 1. 必须标记为客户端组件

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo 区域 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src="/weroam.png"
                  alt="WeRoam logo"
                  width={64}
                  height={64}
                  sizes="64px"
                  quality={100}
                  priority
                />
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">WeRoam</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
              }`}
            >
              首页
            </Link>

            <Link
              href="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/community')
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
              }`}
            >
              社区
            </Link>

            {user && (
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
              >
                个人中心
              </Link>
            )}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">Hi, {user.nickname || user.username}</span>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  退出
                </button>
                <Link href="/profile" className="block">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative">
                    <Image 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`} 
                      alt="Avatar" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-yellow-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-yellow-800 focus:outline-none focus:text-yellow-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-yellow-200">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                首页
              </Link>
              <Link
                href="/community"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/community')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                社区
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                  }`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                >
                  个人中心
                </Link>
              )}
              
              <div className="pt-4 pb-2 border-t border-yellow-100 mt-2 flex flex-col space-y-2 px-3">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3 px-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
                        <Image 
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`} 
                          alt="Avatar" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{user.nickname || user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-center w-full px-4 py-2 border border-red-200 text-red-600 rounded-md text-base font-medium hover:bg-red-50 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-center w-full px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md text-base font-medium hover:bg-yellow-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="block text-center w-full px-4 py-2 bg-yellow-500 text-white rounded-md text-base font-medium hover:bg-yellow-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}