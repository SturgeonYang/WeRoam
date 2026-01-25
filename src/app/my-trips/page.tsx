'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface ChatSession {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        messages: number;
    };
}

export default function MyTripsPage() {
    const { user, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [savedLocations, setSavedLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchSessions();
                fetchSavedLocations();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/chat/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedLocations = async () => {
        try {
            const res = await fetch('/api/user/saved-locations');
            if (res.ok) {
                const data = await res.json();
                setSavedLocations(data);
            }
        } catch (error) {
            console.error('Failed to fetch saved locations:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('确定要删除这个行程计划吗？')) return;

        try {
            const res = await fetch(`/api/chat/sessions/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="h-screen flex flex-col bg-white">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar activeLink="my-trips" />
                
                <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">我的行程计划</h1>
                                <p className="text-gray-500 mt-1">管理您的所有 AI 旅行规划记录</p>
                            </div>
                            <Link 
                                href="/" 
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center"
                            >
                                + 新建计划
                            </Link>
                        </div>

                        {authLoading || loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : !user ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
                                <p className="text-gray-500 mb-6">登录后即可查看和管理您的行程计划</p>
                                <Link href="/login" className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                    去登录
                                </Link>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无行程计划</h3>
                                <p className="text-gray-500 mb-6">您还没有创建过任何行程，快去试试 AI 规划吧！</p>
                                <Link href="/" className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                    开始规划
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map(session => (
                                    <Link 
                                        key={session.id} 
                                        href={`/?chatSessionId=${session.id}`}
                                        className="block group"
                                    >
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-yellow-300 relative h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDelete(e, session.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="删除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                                                {session.title}
                                            </h3>
                                            
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <Clock className="w-4 h-4 mr-1.5" />
                                                {formatDate(session.updatedAt)}
                                            </div>
                                            
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {session._count?.messages || 0} 条对话
                                                </span>
                                                <span className="text-yellow-600 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    查看详情 <ArrowRight className="w-4 h-4 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Saved Locations Section */}
                        {savedLocations.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-red-500" />
                                    收藏的地点
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedLocations.map((loc) => (
                                        <div key={loc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800">{loc.name}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    loc.type === 'food' ? 'bg-orange-100 text-orange-600' : 
                                                    loc.type === 'hotel' ? 'bg-blue-100 text-blue-600' : 
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {loc.type === 'food' ? '餐饮' : loc.type === 'hotel' ? '住宿' : '景点'}
                                                </span>
                                            </div>
                                            {loc.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{loc.description}</p>
                                            )}
                                            <div className="text-xs text-gray-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                收藏于 {formatDate(loc.createdAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
