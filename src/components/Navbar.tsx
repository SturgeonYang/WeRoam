'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-yellow-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                云旅札记
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">WeRoam</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
              }`}
              onClick={() => setActiveTab('home')}
            >
              首页
            </Link>
            <Link
              href="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'community'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
              }`}
              onClick={() => setActiveTab('community')}
            >
              社区
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              个人中心
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
                  activeTab === 'home'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
                onClick={() => {
                  setActiveTab('home');
                  setIsMobileMenuOpen(false);
                }}
              >
                首页
              </Link>
              <Link
                href="/community"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === 'community'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
                onClick={() => {
                  setActiveTab('community');
                  setIsMobileMenuOpen(false);
                }}
              >
                社区
              </Link>
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-800'
                }`}
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                个人中心
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}