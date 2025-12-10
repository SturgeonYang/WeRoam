'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Calendar, Clock, MapPin, Utensils, Map as MapIcon, FileText, Navigation, Heart } from 'lucide-react';
import RouteTimeline, { DayItinerary } from './RouteTimeline'; 

// 动态导入地图组件
const DynamicMapComponent = dynamic(() => import('./MapComponent'), { 
    ssr: false, 
    loading: () => <div className="flex justify-center items-center h-full text-gray-400">🌏 地图加载中...</div> 
});

interface ItineraryModalProps {
    data: DayItinerary[]; 
    destination: string;
    onClose: () => void;
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({ data, destination, onClose }) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0); 
    const [viewMode, setViewMode] = useState<'route' | 'detail'>('route'); // 'route' | 'detail'
    const [focusedPoint, setFocusedPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set()); // Local state for favorites

    // Fetch saved locations on mount
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch('/api/user/saved-locations');
                if (res.ok) {
                    const data = await res.json();
                    const favSet = new Set(data.map((item: any) => item.name));
                    setFavorites(favSet);
                }
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
            }
        };
        fetchFavorites();
    }, []);

    const activeDay = data[activeDayIndex];

    // Helper to safely parse coordinates
    const getCoordinates = (coords: any) => {
        if (!coords) return { lat: NaN, lng: NaN };
        const lat = coords.lat !== undefined ? Number(coords.lat) : (coords.latitude !== undefined ? Number(coords.latitude) : NaN);
        const lng = coords.lng !== undefined ? Number(coords.lng) : (coords.longitude !== undefined ? Number(coords.longitude) : NaN);
        return { lat, lng };
    };

    // Process nodes to ensure valid times and transport info
    const processedActiveDay = useMemo(() => {
        if (!activeDay) return null;

        // Check if times need regeneration (e.g., if multiple nodes have "09:00")
        const times = activeDay.nodes.map(n => n.time);
        const needsRegeneration = times.length > 1 && times[0] === times[1];
        
        let currentTime = 9 * 60; // Start at 9:00 AM

        const nodes = activeDay.nodes.map((node, index) => {
            let displayTime = node.time;

            // Regenerate time if needed
            if (needsRegeneration) {
                // 智能时间调整：根据类型优化时间分布
                if (node.type === 'food') {
                    // 早餐情况 (如果是当天的第一个节点)
                    if (index === 0) {
                        currentTime = 8 * 60 + 30; // 08:30
                    } 
                    // 午餐情况 (如果时间还早，推迟到饭点)
                    else if (currentTime < 11 * 60 + 30) {
                        currentTime = 11 * 60 + 30; // 11:30
                    }
                    // 晚餐情况 (如果是下午，推迟到晚饭点)
                    else if (currentTime > 13 * 60 && currentTime < 17 * 60 + 30) {
                        currentTime = 17 * 60 + 30; // 17:30
                    }
                }

                const hours = Math.floor(currentTime / 60);
                const mins = currentTime % 60;
                displayTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                
                // Calculate duration for next node
                let duration = 0;
                if (node.type === 'spot') duration = 120; // 2 hours
                else if (node.type === 'food') duration = 90; // 1.5 hours
                else if (node.type === 'hotel') duration = 0;

                // Add transport time estimate
                duration += 30; 
                currentTime += duration;
            }

            // Fix Transport Mode
            // Shift transport: node[i] shows transport from node[i-1]
            let transport = undefined;
            if (index > 0) {
                const prevNode = activeDay.nodes[index - 1];
                if (prevNode.transport) {
                    transport = { ...prevNode.transport };
                    
                    // Normalize mode
                    if (transport.mode === '交通' || transport.mode === '移动') {
                        let mode = '乘车'; // Default to '乘车' instead of '移动'
                        if (transport.description?.includes('步行')) mode = '步行';
                        else if (transport.description?.includes('车')) mode = '乘车';
                        else if (transport.description?.includes('地铁')) mode = '地铁';
                        transport.mode = mode;
                    }
                }
            }

            return {
                ...node,
                time: displayTime,
                transport,
                isFavorite: favorites.has(node.location)
            };
        });

        return { ...activeDay, nodes };
    }, [activeDay, favorites]);

    // 获取真实地图点位
    const mapPoints = useMemo(() => {
        if (!processedActiveDay) return [];
        return processedActiveDay.nodes
            .map(node => {
                const { lat, lng } = getCoordinates(node.coordinates);
                return {
                    lat,
                    lng,
                    label: node.location,
                    type: node.type // Pass the type (spot, food, hotel)
                };
            })
            .filter(point => !isNaN(point.lat) && !isNaN(point.lng));
    }, [processedActiveDay]);

    // 统计数据计算
    const stats = useMemo(() => {
        if (!processedActiveDay) return { spotCount: 0, foodCount: 0, duration: '待定' };
        
        const spotCount = processedActiveDay.nodes.filter(n => n.type === 'spot').length;
        const foodCount = processedActiveDay.nodes.filter(n => n.type === 'food').length;
        
        let duration = '待定';
        if (processedActiveDay.nodes.length >= 2) {
            const start = processedActiveDay.nodes[0].time;
            const end = processedActiveDay.nodes[processedActiveDay.nodes.length - 1].time;
            
            const cleanTime = (t: string) => t.split('-')[0].trim();
            const parseTime = (t: string) => {
                const [h, m] = cleanTime(t).split(':').map(Number);
                return h * 60 + m;
            };

            try {
                const startMins = parseTime(start);
                const endMins = parseTime(end);
                const diffMins = endMins - startMins;
                if (!isNaN(diffMins) && diffMins > 0) {
                    const hours = Math.floor(diffMins / 60);
                    const totalHours = hours + 1.5; 
                    duration = `${totalHours.toFixed(1)} 小时`; 
                }
            } catch (e) {
                console.warn('Time parse error', e);
            }
        }
        
        return { spotCount, foodCount, duration };
    }, [processedActiveDay]);

    const handleToggleFavorite = async (node: any) => {
        // Optimistic update
        const newFavs = new Set(favorites);
        const isAdding = !newFavs.has(node.location);
        
        if (isAdding) {
            newFavs.add(node.location);
        } else {
            newFavs.delete(node.location);
        }
        setFavorites(newFavs);

        // API Call
        try {
            const { lat, lng } = getCoordinates(node.coordinates);
            const res = await fetch('/api/user/saved-locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: node.location,
                    description: node.description,
                    type: node.type,
                    lat: isNaN(lat) ? null : lat,
                    lng: isNaN(lng) ? null : lng
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save location');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setFavorites(prev => {
                const reverted = new Set(prev);
                if (isAdding) reverted.delete(node.location);
                else reverted.add(node.location);
                return reverted;
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {/* 标题和关闭按钮 */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-yellow-500 text-white flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {destination} - 完整行程计划 ({data.length} 天)
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-yellow-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 导航栏 (Day Tabs) */}
                <nav className="flex-shrink-0 bg-gray-50 border-b border-gray-200 overflow-x-auto whitespace-nowrap flex justify-between items-center pr-4">
                    <div className="flex">
                        {data.map((dayData, index) => (
                            <button
                                key={dayData.day}
                                onClick={() => setActiveDayIndex(index)}
                                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 
                                    ${index === activeDayIndex 
                                        ? 'border-yellow-500 text-yellow-600 bg-white shadow-inner' 
                                        : 'border-transparent text-gray-600 hover:text-yellow-700 hover:bg-gray-100'
                                    }`}
                            >
                                DAY {dayData.day} - {dayData.theme}
                            </button>
                        ))}
                    </div>
                    
                    {/* 视图切换 Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('route')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${
                                viewMode === 'route' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <MapIcon className="w-3 h-3 mr-1" /> 路线视图
                        </button>
                        <button
                            onClick={() => setViewMode('detail')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${
                                viewMode === 'detail' 
                                ? 'bg-white text-yellow-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileText className="w-3 h-3 mr-1" /> 详情视图
                        </button>
                    </div>
                </nav>

                {/* 主体内容区域 */}
                <div className="flex-1 overflow-hidden bg-gray-50 p-4">
                    
                    {/* 模式 A: 路线视图 (左侧时间线 + 右侧地图) */}
                    {viewMode === 'route' && (
                        <div className="flex h-full gap-4">
                            {/* 左侧：精简时间线 (40%) */}
                            <div className="w-[40%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                                        <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded mr-2">DAY {activeDay?.day}</span>
                                        行程概览
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {processedActiveDay && (
                                        <RouteTimeline 
                                            day={processedActiveDay.day}
                                            nodes={processedActiveDay.nodes}
                                            variant="detailed"
                                            hideDescription={true} // 隐藏描述，只保留核心信息
                                            onToggleFavorite={handleToggleFavorite}
                                            onNodeLocate={(node) => {
                                                console.log('onNodeLocate clicked:', node);
                                                if (node.coordinates) {
                                                    const { lat, lng } = getCoordinates(node.coordinates);
                                                    console.log('Parsed coordinates:', lat, lng);
                                                    if (!isNaN(lat) && !isNaN(lng)) {
                                                        setFocusedPoint({ lat, lng });
                                                    } else {
                                                        console.warn('Invalid coordinates for node:', node.name, node.coordinates);
                                                    }
                                                } else {
                                                    console.warn('No coordinates for node:', node.name);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* 右侧：地图 (60%) */}
                            <div className="w-[60%] bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 relative">
                                <DynamicMapComponent 
                                    points={mapPoints} 
                                    heightClass="h-full" 
                                    focusedPoint={focusedPoint}
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md text-xs text-gray-600 border border-gray-200 z-[1000]">
                                    🗺️ 地图模式：展示今日路线走向
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 模式 B: 详情视图 (全宽列表 + 顶部统计) */}
                    {viewMode === 'detail' && (
                        <div className="h-full flex flex-col gap-4 overflow-hidden">
                            {/* 顶部统计条 (合并展示) */}
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">景点</div>
                                            <div className="text-lg font-bold text-gray-800">{stats.spotCount} 个</div>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">餐饮</div>
                                            <div className="text-lg font-bold text-gray-800">{stats.foodCount} 家</div>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">预计耗时</div>
                                            <div className="text-lg font-bold text-gray-800">{stats.duration}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 italic">
                                    * 建议提前查看景点预约信息
                                </div>
                            </div>

                            {/* 详细卡片列表 */}
                            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                {processedActiveDay && (
                                    <RouteTimeline 
                                        day={processedActiveDay.day}
                                        nodes={processedActiveDay.nodes}
                                        variant="detailed"
                                        hideDescription={false}
                                        onToggleFavorite={handleToggleFavorite}
                                        onNodeLocate={(node) => {
                                            if (node.coordinates) {
                                                const { lat, lng } = getCoordinates(node.coordinates);
                                                if (!isNaN(lat) && !isNaN(lng)) {
                                                    setViewMode('route');
                                                    setTimeout(() => setFocusedPoint({ lat, lng }), 100);
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ItineraryModal;
