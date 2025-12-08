// src/components/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

// 消息接口定义
interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const { user } = useAuth();
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
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('chatSessionId');

  // 加载历史记录
  useEffect(() => {
    if (user) {
      const endpoint = urlSessionId 
        ? `/api/chat/sessions/${urlSessionId}` 
        : '/api/chat/history';

      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          if (data.id || data.sessionId) {
            setSessionId(data.id || data.sessionId);
          }
          if (data.messages && data.messages.length > 0) {
            const formattedMessages = data.messages.map((msg: any) => ({
              id: msg.id,
              type: msg.role === 'assistant' ? 'ai' : 'user',
              content: msg.content,
              timestamp: new Date(msg.createdAt),
            }));
            setMessages(formattedMessages);
          } else if (urlSessionId) {
             // If loading a specific session but no messages (or empty), maybe just set messages to empty?
             // Or keep default welcome message if it's a new session?
             // But here we are loading an existing session.
             setMessages([]);
          }
        })
        .catch(err => console.error('Failed to load chat history', err));
    }
  }, [user, urlSessionId]);

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: '您好！我是您的智能旅行规划助手。请告诉我您想去哪里旅行，我可以为您提供个性化的旅行建议！',
      timestamp: new Date(),
    }]);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 每次消息更新后滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  // 核心函数：处理消息发送和流式 API 调用
  const handleSendMessage = async () => {
    // 确保输入框不为空且 AI 没有在回复
    if (!inputText.trim() || isTyping) return;
    
    const content = inputText.trim();

    const newUserMessage: Message = {
        id: Date.now(),
        type: 'user',
        content: content,
        timestamp: new Date(),
    };

    // 1. 立即显示用户消息，并清除输入框
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true); // 开启打字指示器

    // 2. 构造要发送给 Route Handler 的消息历史 (限制历史记录大小)
    const historyLimit = 8;
    const messagesHistory = [...messages.slice(messages.length - historyLimit), newUserMessage]
        .map(msg => ({ 
            role: msg.type === 'ai' ? 'assistant' : 'user', 
            content: msg.content 
        }));

    // 3. 准备接收 AI 流式响应的消息占位符
    const aiMessageId = Date.now() + 1;
    let newAIMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
    };
    // 立即添加到消息列表，内容为空，稍后流式更新
    setMessages(prev => [...prev, newAIMessage]);
    
    let currentContent = ''; // 用于累计 AI 响应的文本

    try {
        // 4. 调用后端的 Route Handler (/api/chat)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: messagesHistory,
              sessionId: sessionId 
            }),
        });

        if (!response.ok || !response.body) {
             const errorText = await response.text();
             throw new Error(`API 调用失败: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        const newSessionId = response.headers.get('X-Session-Id');
        if (newSessionId) {
            setSessionId(parseInt(newSessionId));
        }

        // 5. 使用 ReadableStreamReader 处理流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // 循环读取流数据
        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            // 解码并解析 SSE 数据块
            const chunk = decoder.decode(value, { stream: true });
            
            // 通义千问的流式响应是 SSE 格式 (data: {...}\n\n)
            const events = chunk.split('\n\n').filter(s => s.trim().startsWith('data:'));

            for (const event of events) {
                try {
                    const jsonString = event.replace(/^data:\s*/, '').trim();
                    if (!jsonString) continue;
                    
                    // ⭐ 修正核心：检查并跳过流终止标记 [DONE]
                    if (jsonString === '[DONE]') {
                        done = true; 
                        break; 
                    }
                    
                    const data = JSON.parse(jsonString);
                    
                    // 提取增量文本 (OpenAI 兼容模式使用 choices[0].delta.content)
                    const textChunk = data.choices?.[0]?.delta?.content || "";

                    if (textChunk) {
                        currentContent += textChunk;

                        // 实时更新 AI 消息的内容
                        setMessages(prevMessages => {
                            return prevMessages.map(msg => 
                                msg.id === aiMessageId ? { ...msg, content: currentContent } : msg
                            );
                        });
                    }
                    
                } catch (e) {
                    console.error('Error parsing JSON chunk:', e, 'Chunk:', event);
                }
            }
            
            // 确保在内层循环 break (遇到 [DONE]) 后，也能跳出外层 while 循环
            if (done) break; 
        }

    } catch (error) {
        console.error("Stream failed:", error);
        
        // 失败时，更新 AI 消息为错误提示
        setMessages(prevMessages => {
            return prevMessages.map(msg => 
                msg.id === aiMessageId ? { 
                    ...msg, 
                    content: currentContent || `抱歉，AI 服务连接失败或 API 调用错误：${(error as Error).message}`, 
                    type: 'ai' 
                } : msg
            );
        });

    } finally {
        setIsTyping(false); // 无论成功失败，关闭打字指示器
    }
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
    // 整体容器：淡黄色边框，圆角，阴影
    <div className="max-w-full mx-auto bg-white rounded-xl shadow-2xl border-4 border-yellow-200 overflow-hidden">
      
      {/* 头部：AI 旅行顾问 */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            AI 旅行顾问
          </h3>
          <p className="text-yellow-100 text-sm">为您提供个性化旅行建议</p>
        </div>
        <button 
          onClick={handleNewChat}
          className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
        >
          新对话
        </button>
      </div>

      {/* 消息区域：浅黄色背景，自动滚动 */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-yellow-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              // AI 头像 (左侧)
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white shadow-md mr-2">
                AI
              </div>
            )}

            {/* 消息气泡容器 */}
            <div className="flex flex-col max-w-xs sm:max-w-md">
              <div
                className={`px-4 py-3 text-gray-800 shadow-md transition-colors ${
                  message.type === 'user'
                    ? 'bg-yellow-300/90 rounded-2xl rounded-tr-sm' 
                    : 'bg-amber-100/80 rounded-2xl rounded-tl-sm'  
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* 仅在 AI 消息中显示“保存到社区”按钮 */}
                {message.type === 'ai' && message.content.length > 50 && (
                  <button
                    onClick={() => saveToCommunity(message.content)}
                    className="mt-1 text-xs text-yellow-700/80 hover:text-yellow-800 underline transition-colors"
                  >
                    保存到社区
                  </button>
                )}
              </div>
            </div>

            {message.type === 'user' && (
              // 用户头像 (右侧)
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-md ml-2">
                你
              </div>
            )}
          </div>
        ))}
        
        {/* AI 正在打字指示器 */}
        {isTyping && (
          <div className="flex justify-start items-center space-x-3">
            {/* AI 头像 */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-white shadow-md">
                AI
            </div>
            {/* 打点动画 */}
            <div className="bg-amber-100/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* 锚点，用于自动滚动 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框和发送区域 */}
      <div className="border-t border-yellow-300 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isTyping ? "AI 正在思考..." : "请描述您的旅行需求..."}
            className="flex-1 border border-yellow-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/80 focus:border-transparent transition bg-yellow-50"
            disabled={isTyping} // AI 打字时禁用输入
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-1 sm:mr-0 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">发送</span>
          </button>
        </div>
      </div>
    </div>
  );
}