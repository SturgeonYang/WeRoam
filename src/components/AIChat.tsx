'use client';

import { useState } from 'react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '您好！我是您的智能旅行规划助手。请告诉我您想去哪里旅行，我可以为您提供个性化的旅行建议！',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const aiResponses = [
    '根据您的需求，我推荐您去日本京都。春季的樱花季非常美丽，您可以参观清水寺、金阁寺等著名景点。建议行程安排3-5天，预算大约8000-12000元。推荐住宿：祗园附近的传统旅馆。',
    '泰国是个不错的选择！普吉岛的海滩、曼谷的寺庙文化、清迈的古城风情都值得体验。最佳旅行时间是11月到次年3月，避开雨季。建议预算：5000-8000元（5-7天）。',
    '如果您喜欢自然风光，我推荐新疆。天山天池、喀纳斯湖、赛里木湖都是绝美的景色。夏季是最佳旅行时间，记得准备防晒用品。建议自驾游，行程10-15天。',
    '欧洲之旅怎么样？法国巴黎的浪漫、意大利的艺术、瑞士的雪山湖泊...建议安排10-15天的行程，可以体验多国文化。最佳时间：4-6月或9-10月。',
    '国内游推荐：桂林山水甲天下，漓江竹筏、阳朔西街、龙脊梯田都很值得一去。3-4天行程，预算2000-4000元。最佳时间：4-5月或9-11月。',
    '海岛度假推荐马尔代夫！一岛一酒店的模式，水上屋体验、浮潜、日落巡航...适合蜜月或度假。建议5-7天，预算15000-30000元。全年适宜，避开雨季6-8月。'
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    // 模拟AI响应延迟
    setTimeout(() => {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveToCommunity = (content: string) => {
    alert(`已保存到社区：\n"${content}"`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
          AI 旅行顾问
        </h3>
        <p className="text-yellow-100 text-sm">为您提供个性化旅行建议</p>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-yellow-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.type === 'ai' && (
                <button
                  onClick={() => saveToCommunity(message.content)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  保存到社区
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-yellow-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请描述您的旅行需求..."
            className="flex-1 border border-yellow-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-xl transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}