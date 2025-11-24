'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 将文件转换为 base64 用于预览
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: 实现实际的提交逻辑
    // 这里应该调用 API 将数据保存到数据库
    console.log({
      title,
      content,
      images,
    });

    // 模拟提交延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    alert('游记发布成功！');
    setIsSubmitting(false);
    
    // 重置表单
    setTitle('');
    setContent('');
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
            发布游记
          </h1>
          <p className="text-yellow-100 text-center text-lg">
            分享您的旅行故事，让更多人看到世界的美好
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-yellow-100">
            <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
              游记标题
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：北京故宫三日游 - 走进历史的长河"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all text-gray-800 placeholder-gray-400"
            />
            <p className="text-sm text-gray-500 mt-2">
              给您的游记起一个吸引人的标题
            </p>
          </div>

          {/* Content Textarea */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-yellow-100">
            <label htmlFor="content" className="block text-lg font-semibold text-gray-800 mb-3">
              游记内容
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的旅行经历、感受、攻略...&#10;&#10;可以包括：&#10;• 旅行路线和行程安排&#10;• 景点介绍和游玩体验&#10;• 美食推荐和住宿建议&#10;• 旅行中的趣事和感悟"
              required
              rows={12}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all resize-y text-gray-800 placeholder-gray-400"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">
                详细记录您的旅行故事
              </p>
              <p className="text-sm text-gray-400">
                {content.length} 字
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-yellow-100">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              上传图片
            </label>
            
            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-yellow-300 rounded-xl cursor-pointer bg-yellow-50 hover:bg-yellow-100 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-12 h-12 mb-3 text-yellow-500 group-hover:text-yellow-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold text-yellow-600">点击上传</span> 或拖拽图片到这里
                    </p>
                    <p className="text-xs text-gray-500">
                      支持 PNG, JPG, GIF 格式（建议大小不超过 5MB）
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    已上传 {images.length} 张图片
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200"
                      >
                        <img
                          src={image}
                          alt={`上传图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        {/* Image Number */}
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              💡 提示：上传精美的照片可以让您的游记更加吸引人
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  发布中...
                </span>
              ) : (
                '发布游记'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (confirm('确定要放弃编辑吗？所有内容将不会保存。')) {
                  setTitle('');
                  setContent('');
                  setImages([]);
                }
              }}
              className="sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              取消
            </button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              发布小贴士
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>标题简洁明了，突出旅行目的地和特色</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>内容丰富详实，分享真实的旅行体验和感受</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>上传清晰美观的照片，让读者身临其境</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>可以添加实用的旅行攻略，帮助其他旅行者</span>
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
