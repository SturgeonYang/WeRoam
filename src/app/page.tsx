'use client'; 

import Navbar from '@/components/Navbar';
import AIChat from '@/components/AIChat';
import Sidebar from '@/components/Sidebar'; 
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// --- 新增：地图点位类型定义（与 MapComponent.tsx 保持一致） ---
interface Point {
  lat: number;
  lng: number;
  label?: string;
}

// --- 新增：默认中心点位数据（取代 MOCK_DB） ---
// 默认设置为不明确状态
const DEFAULT_CENTER_POINT: Point[] = [];

// -------------------------------------------------------------

function HomeContent() {
    // ✅ 修正：使用本地定义的 DEFAULT_CENTER_POINT 初始化状态
    const [mapPoints, setMapPoints] = useState<Point[]>(DEFAULT_CENTER_POINT);
    const [currentMapDestination, setCurrentMapDestination] = useState('目的地待定');
    const searchParams = useSearchParams();
    const chatSessionId = searchParams.get('chatSessionId');

    /**
     * @description 接收来自 AIChat 的更新：目的地名称和地图点位
     */
    const handleRouteUpdate = (destination: string, points: Point[]) => {
        setCurrentMapDestination(destination);
        setMapPoints(points);
    };
    
    return (
        <div className="h-screen flex flex-col bg-white">
            <Navbar />
            
            {/* 核心布局：Sidebar (左) + Main AI Chat Area (右) */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* 左侧侧边栏 (Sidebar) */}
                <Sidebar activeLink="ai-planner" />
                
                {/* 右侧主内容区：AI Chat Area - 占据大部分空间 */}
                <main className="flex-1 flex flex-col overflow-hidden bg-white">
                    
                    {/* 顶部的标题/工具栏 (Main Content Header) */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                AI 智能旅行规划
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">
                                当前目的地: <span className="text-yellow-600 font-semibold">{currentMapDestination}</span>
                            </p>
                        </div>
                    </div>

                    {/* AI Chat Area (占据剩余空间) - 全宽展示 */}
                    <div className="flex-1 overflow-hidden"> 
                        <AIChat 
                            onRouteUpdate={handleRouteUpdate} 
                            sessionId={chatSessionId ? parseInt(chatSessionId) : undefined}
                        /> 
                    </div>

                </main>
                
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}