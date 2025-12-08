'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CreatePostButton() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        title="请先登录"
      >
        <span className="mr-2">🔒</span>
        登录后发布
      </Link>
    );
  }

  return (
    <Link
      href="/create-post"
      className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-full shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"
    >
      <span className="mr-2">✏️</span>
      发布游记
    </Link>
  );
}