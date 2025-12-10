// src/components/Sidebar.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Settings, Calendar, MessageSquare, Clock, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    activeLink: 'ai-planner' | 'my-trips';
}

interface ChatSession {
    id: number;
    title: string;
    updatedAt: string;
}

const navItems = [
    { id: 'ai-planner', name: 'AI 智能规划', icon: Sparkles, href: '/' },
    { id: 'my-trips', name: '我的行程计划', icon: Calendar, href: '/my-trips' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeLink }) => {
    const { user } = useAuth();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetch('/api/chat/sessions')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setChatSessions(data);
                    }
                })
                .catch(err => console.error('Failed to fetch chat sessions:', err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        
        // Check if it's the same day
        const isSameDay = date.getDate() === now.getDate() && 
                          date.getMonth() === now.getMonth() && 
                          date.getFullYear() === now.getFullYear();

        if (isSameDay) {
            const diff = now.getTime() - date.getTime();
            if (diff < 60 * 60 * 1000) {
                const minutes = Math.max(1, Math.floor(diff / (60 * 1000)));
                return `${minutes}分钟前`;
            }
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours}小时前`;
        }

        // For different days, calculate day difference
        const oneDay = 24 * 60 * 60 * 1000;
        const dateNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const diffDays = Math.round(Math.abs((nowNoTime.getTime() - dateNoTime.getTime()) / oneDay));
        return `${diffDays}天前`;
    };

    return (
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full p-4 flex-shrink-0 shadow-lg">
            
            {/* Logo/Title Area */}
            <div className="mb-8 pl-3">
                <h2 className="text-2xl font-extrabold text-gray-900" suppressHydrationWarning>云旅札记</h2>
                <p className="text-xs text-yellow-600">AI 旅行工作台</p>
            </div>
            
            {/* 主要导航链接 */}
            <nav className="space-y-1 mb-8">
                <Link
                    href="/"
                    className="flex items-center justify-center px-3 py-2 mb-4 rounded-lg text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-sm"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    开启新对话
                </Link>

                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`
                            flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                            ${item.id === activeLink
                                ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* AI 对话记录区域 */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-3 mb-2 flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3 mr-1" />
                    最近对话
                </div>
                
                {loading ? (
                    <div className="px-3 py-2 text-sm text-gray-400">加载中...</div>
                ) : chatSessions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">暂无对话记录</div>
                ) : (
                    <div className="space-y-1">
                        {chatSessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/?chatSessionId=${session.id}`}
                                className="group flex flex-col px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400 group-hover:text-yellow-500 flex-shrink-0" />
                                    <span className="truncate font-medium">{session.title}</span>
                                </div>
                                <span className="text-xs text-gray-400 ml-6 mt-0.5">{formatDate(session.updatedAt)}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            
            {/* 底部设置 */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                >
                    <Settings className="w-5 h-5 mr-3" />
                    设置
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;