'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user data when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.nickname || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setPreviewUrl(user.avatar || null);
      setAvatarFile(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, bio, location, avatar: avatarUrl }),
      });

      if (!res.ok) throw new Error('Update failed');

      await refreshUser();
      onClose();
    } catch (error) {
      console.error(error);
      alert('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">编辑个人资料</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-100 relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image 
                src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`} 
                alt="Avatar" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">更换头像</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}