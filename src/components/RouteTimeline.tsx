'use client';

import React, { useState } from 'react';
import { MapPin, Utensils, Bed, Camera, Navigation, Clock, ArrowDown, Heart } from 'lucide-react';

export interface ItineraryNode {
    time: string;
    location: string;
    description: string;
    type: 'spot' | 'food' | 'hotel';
    isFavorite?: boolean; // Added for favorite functionality
    coordinates?: {
        lat: number;
        lng: number;
    };
    transport?: {
        mode: string;
        duration: string;
        cost?: string;
        description?: string;
    };
}

export interface DayItinerary {
    day: number;
    theme: string;
    nodes: ItineraryNode[];
}

interface RouteTimelineProps {
    day: number;
    nodes: ItineraryNode[];
    variant?: 'simple' | 'detailed';
    hideDescription?: boolean;
    onClick?: () => void;
    onNodeLocate?: (node: ItineraryNode) => void;
    onToggleFavorite?: (node: ItineraryNode, index: number) => void; // Callback for favorite
}

const RouteTimeline: React.FC<RouteTimelineProps> = ({ 
    day, 
    nodes, 
    variant = 'detailed',
    hideDescription = false,
    onClick,
    onNodeLocate,
    onToggleFavorite
}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'food': return <Utensils className="w-4 h-4" />;
            case 'hotel': return <Bed className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'food': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'hotel': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-green-100 text-green-600 border-green-200';
        }
    };

    return (
        <div 
            className={`relative pl-4 py-2 ${onClick ? 'cursor-pointer hover:bg-gray-50 rounded-lg transition-colors' : ''}`}
            onClick={onClick}
        >
            {nodes.map((node, index) => (
                <div key={index} className="relative mb-8 last:mb-0">
                    {/* 连接线 */}
                    {index !== nodes.length - 1 && (
                        <div className="absolute left-[19px] top-8 bottom-[-32px] w-0.5 bg-gray-200 z-0"></div>
                    )}

                    <div className="relative z-10 flex gap-4">
                        {/* 左侧图标 */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${getColor(node.type)}`}>
                            {getIcon(node.type)}
                        </div>

                        {/* 右侧内容卡片 */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 truncate pr-2">{node.location}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            {node.time}
                                        </span>
                                        {onToggleFavorite && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleFavorite(node, index);
                                                }}
                                                className={`p-1 rounded-full transition-colors ${
                                                    node.isFavorite 
                                                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                                title={node.isFavorite ? "取消收藏" : "收藏地点"}
                                            >
                                                <Heart className={`w-3.5 h-3.5 ${node.isFavorite ? 'fill-current' : ''}`} />
                                            </button>
                                        )}
                                        {onNodeLocate && node.coordinates && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNodeLocate(node);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="在地图上定位"
                                            >
                                                <Navigation className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {!hideDescription && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {node.description}
                                    </p>
                                )}

                                {/* 交通信息卡片 (如果有) */}
                                {node.transport && (
                                    <div className="mt-3 -mx-3 -mb-3 bg-gray-50 border-t border-gray-100 p-2 text-xs text-gray-500 rounded-b-lg">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {/* 耗时提示 */}
                                            <div className="flex items-center gap-1 text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">
                                                <Clock className="w-3 h-3 text-blue-500" />
                                                <span className="font-medium">抵达耗时:</span>
                                                <span className="font-bold text-gray-800">{node.transport.duration}</span>
                                            </div>
                                            
                                            {/* 交通方式 */}
                                            {node.transport.mode && (
                                                <div className="flex items-center gap-1 text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">
                                                    <Navigation className="w-3 h-3 text-green-600" />
                                                    <span className="font-medium">方式:</span>
                                                    <span className="font-bold text-gray-800">{node.transport.mode}</span>
                                                </div>
                                            )}

                                            {node.transport.cost && (
                                                <span className="text-orange-500 font-medium ml-1">({node.transport.cost})</span>
                                            )}
                                        </div>
                                        
                                        {node.transport.description && (
                                            <div className="text-gray-500 italic whitespace-normal break-words mt-2 pl-2 border-l-2 border-yellow-300">
                                                {node.transport.description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* 节点间距装饰 (仅在非最后一个节点显示) */}
                            {index !== nodes.length - 1 && (
                                <div className="h-4 flex items-center justify-center ml-[-2.5rem] mt-2 opacity-0">
                                    <ArrowDown className="w-3 h-3 text-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RouteTimeline;
