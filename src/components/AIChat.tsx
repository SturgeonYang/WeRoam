// src/components/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, MapIcon, X, PlusCircle, StopCircle, Loader2, FileText } from 'lucide-react'; 
import { useAuth } from '@/context/AuthContext';

// ✅ 导入必要的组件和类型
import TripPlanningForm, { TripFormData } from './TripPlanningForm'; 
// 导入 RouteTimeline 和 ItineraryNode
import RouteTimeline, { ItineraryNode as RouteNode } from './RouteTimeline'; 
import ItineraryModal from './ItineraryModal';

// --- 重新定义结构化类型以匹配后端的 JSON Schema ---

// 定义单日行程结构（必须与 ItineraryModal.tsx 中使用的类型一致）
interface DayItinerary {
    day: number;
    theme: string;
    nodes: RouteNode[]; 
}

// --- Qwen API 期望的最终数据结构 (现在使用 DayItinerary 类型) ---
interface QwenItinerary {
    destination: string;
    itinerary: DayItinerary[]; // N 天的行程数组
}

interface Message {
    id: number;
    type: 'user' | 'ai';
    content: string;
    isRoutePlan?: boolean; 
    routeData?: RouteNode[]; // 仅用于展示第一天的卡片 (RouteTimeline 组件需要 RouteNode[] 类型)
    fullItinerary?: QwenItinerary; // 存储完整的 N 天行程数据
    timestamp: Date;
}

interface AIChatProps {
    onRouteUpdate: (destination: string, points: any[]) => void;
    sessionId?: number;
}

// --- MOCK_DB (用于地图点位，不变) ---
const MOCK_DB = {
    '上海': { points: [{ lat: 31.2304, lng: 121.4737, label: '外滩' }, { lat: 31.2238, lng: 121.4586, label: '人民广场' }] },
    '杭州': { points: [{ lat: 30.2464, lng: 120.1259, label: '西湖' }, { lat: 30.2523, lng: 120.1551, label: '灵隐寺' }] },
    '北京': { points: [{ lat: 39.9042, lng: 116.4074, label: '天安门' }, { lat: 39.9169, lng: 116.3907, label: '故宫' }] },
    '默认': { points: [{ lat: 30.00, lng: 110.00, label: '通用地标1' }, { lat: 30.10, lng: 110.10, label: '通用地标2' }] },
};


// 动态导入地图组件 (不变)
const DynamicMapComponent = dynamic(() => import('./MapComponent'), { 
    ssr: false, 
    loading: () => <div className="flex justify-center items-center h-full min-h-[300px] text-gray-400">🌏 地图加载中...</div> 
});

const customComponents = {
  strong: ({ node, ...props }: any) => <b className="font-bold text-yellow-700" {...props} />,
};

// Helper function to process nodes for display (consistent with ItineraryModal)
const processRouteNodes = (nodes: RouteNode[]): RouteNode[] => {
    if (!nodes || nodes.length === 0) return [];

    // Check if times need regeneration (e.g., if multiple nodes have "09:00")
    const times = nodes.map(n => n.time);
    const needsRegeneration = times.length > 1 && times[0] === times[1];
    
    let currentTime = 9 * 60; // Start at 9:00 AM

    return nodes.map((node, index) => {
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
            if (node.type === 'spot') duration = 120; // 景点 2 hours
            else if (node.type === 'food') duration = 90; // 餐饮 1.5 hours
            else if (node.type === 'hotel') duration = 0;

            // Add transport time estimate (30 mins)
            duration += 30; 
            currentTime += duration;
        }

        // Fix Transport Mode
        // Shift transport: node[i] shows transport from node[i-1]
        let transport = undefined;
        if (index > 0) {
            const prevNode = nodes[index - 1];
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
            transport
        };
    });
};


export default function AIChat({ onRouteUpdate, sessionId }: AIChatProps) {
    const { user } = useAuth();
        const [messages, setMessages] = useState<Message[]>([{ id: 1, type: 'ai', content: '您好！我是您的 WeRoam 助手。告诉我您想去哪里？', timestamp: new Date() }]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Modal 状态
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isItineraryOpen, setIsItineraryOpen] = useState(false); 
    
    // 核心数据状态：currentRouteData 存储完整的 Qwen API 返回的结构化数据 (N天)
    const [currentDestination, setCurrentDestination] = useState('上海'); 
    const [currentMapPoints, setCurrentMapPoints] = useState(MOCK_DB['默认'].points);
    const [currentRouteData, setCurrentRouteData] = useState<QwenItinerary | null>(null); 
    
    // 用于预填充表单的状态
    const [prefilledData, setPrefilledData] = useState<Partial<TripFormData>>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages, isTyping]); 

    // Load history when sessionId changes
    useEffect(() => {
        if (!sessionId) {
            // New Chat Mode: Reset to default state
            setMessages([{ id: 1, type: 'ai', content: '您好！我是您的 WeRoam 助手。告诉我您想去哪里？', timestamp: new Date() }]);
            setCurrentSessionId(null);
            return;
        }

        const fetchHistory = async () => {
            try {
                const url = `/api/chat/history?sessionId=${sessionId}`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Restore session destination if available
                    if (data.destination) {
                        setCurrentDestination(data.destination);
                    } else {
                        // 如果会话没有记录目的地，重置为默认值，避免显示上一个会话的目的地
                        setCurrentDestination('上海');
                    }

                    if (data.messages && data.messages.length > 0) {
                        // Transform messages if needed, or just set them
                        // Assuming API returns messages in a compatible format or we map them
                        const formattedMessages = data.messages.map((msg: any) => {
                            let content = msg.content;
                            let routeData: RouteNode[] | undefined = undefined;
                            let fullItinerary: QwenItinerary | undefined = undefined;
                            let isRoutePlan = false;

                            // 尝试提取隐藏的行程数据
                            const dataMatch = content.match(/<!--ITINERARY_DATA:(.*?)-->/);
                            if (dataMatch && dataMatch[1]) {
                                try {
                                    const parsedData = JSON.parse(dataMatch[1]);
                                    isRoutePlan = true;
                                    
                                    if (Array.isArray(parsedData)) {
                                        // 旧格式：只保存了第一天的 RouteNode[]
                                        routeData = parsedData;
                                        // 构造一个临时的 fullItinerary 以便 Modal 显示
                                        fullItinerary = {
                                            destination: '未知目的地', // 旧数据没存目的地，只能模糊处理
                                            itinerary: [{ day: 1, theme: '行程概览', nodes: parsedData }]
                                        };
                                    } else if (parsedData.itinerary) {
                                        // 新格式：保存了完整的 QwenItinerary 对象
                                        fullItinerary = parsedData;
                                        // 提取第一天数据用于卡片展示
                                        if (fullItinerary && fullItinerary.itinerary.length > 0) {
                                            routeData = fullItinerary.itinerary[0].nodes;
                                        }
                                    }

                                    // 移除隐藏数据以便显示
                                    content = content.replace(/<!--ITINERARY_DATA:.*?-->/, '');
                                } catch (e) {
                                    console.error('Failed to parse hidden itinerary data', e);
                                }
                            }

                            return {
                                id: msg.id,
                                type: msg.role === 'user' ? 'user' : 'ai',
                                content: content,
                                timestamp: new Date(msg.createdAt),
                                isRoutePlan,
                                routeData,
                                fullItinerary
                            };
                        });
                        setMessages(formattedMessages);
                        setCurrentSessionId(data.sessionId);
                    } else {
                        // If specific session requested but empty/not found
                        setMessages([{ id: 1, type: 'ai', content: '未找到该会话记录，已为您开启新对话。', timestamp: new Date() }]);
                        setCurrentSessionId(null);
                    }
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };

        fetchHistory();
    }, [sessionId]);

    const stopGeneration = () => {
        setIsTyping(false);
    };

    /**
     * ✅ 核心逻辑：调用真实的 Qwen API 接口，路径已修正
     */
    const callItineraryAPI = async (formData: TripFormData) => {
        const msgId = Date.now();
        const destination = formData.destination || "未知目的地";

        setIsTyping(true);
        setCurrentDestination(destination);

        // 1. 发送 API 请求前的提示消息
        setMessages(prev => [...prev, { id: msgId, type: 'ai', content: `正在为 **${destination}** 生成 ${formData.days} 天路线...请稍候... 🌍`, timestamp: new Date() }]);
        
        try {
            // 关键路径修正：使用 /api/chat/itinerary
            const res = await fetch('/api/chat/itinerary', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                signal: abortControllerRef.current?.signal 
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: '未知错误' }));
                throw new Error(errorData.error || '后端生成失败');
            }

            const { data } = await res.json();
            const itineraryData: QwenItinerary = data;

            // 强制确保 destination 字段存在且正确 (使用前端请求时的目的地)
            // 这防止了 LLM 有时未返回 destination 字段导致的问题
            if (!itineraryData.destination || itineraryData.destination === '未知目的地') {
                itineraryData.destination = destination;
            }

            // 2. 验证并存储数据
            if (!itineraryData?.itinerary || itineraryData.itinerary.length === 0) {
                 throw new Error('Qwen 未返回有效的行程数据。');
            }

            const daysGenerated = itineraryData.itinerary.length;
            const firstDayRoute = itineraryData.itinerary[0].nodes;
            
            setCurrentRouteData(itineraryData); // 存储完整的 N 天路线
            
            // 3. 更新地图点位 (使用 AI 返回的真实坐标，并尝试进行客户端地理编码修正)
            const allPoints: any[] = [];
            
            // 辅助函数：延迟执行
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // 辅助函数：计算两点间距离 (Haversine formula)
            const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
                const R = 6371; // Radius of the earth in km
                const dLat = (lat2 - lat1) * (Math.PI / 180);
                const dLng = (lng2 - lng1) * (Math.PI / 180);
                const a = 
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
                    Math.sin(dLng / 2) * Math.sin(dLng / 2); 
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
                return R * c; // Distance in km
            };

            // 1. 获取目的地中心坐标 (作为基准点)
            let destCenter = { lat: 0, lng: 0 };
            try {
                const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1&accept-language=zh`, {
                    headers: { 'User-Agent': 'WeRoam-Travel-App/1.0' }
                });
                if (destRes.ok) {
                    const destData = await destRes.json();
                    if (destData && destData.length > 0) {
                        destCenter = { lat: parseFloat(destData[0].lat), lng: parseFloat(destData[0].lon) };
                    }
                }
            } catch (e) {
                console.warn('Failed to get destination center', e);
            }

            // 收集所有需要显示的节点
            const nodesToGeocode: { dayIndex: number, nodeIndex: number, location: string, originalLat?: number, originalLng?: number }[] = [];
            
            itineraryData.itinerary.forEach((day, dIndex) => {
                day.nodes.forEach((node, nIndex) => {
                    if (node.location) {
                        nodesToGeocode.push({
                            dayIndex: dIndex,
                            nodeIndex: nIndex,
                            location: node.location,
                            originalLat: node.coordinates?.lat,
                            originalLng: node.coordinates?.lng
                        });
                    }
                });
            });

            // 限制地理编码数量以避免速率限制 (仅处理前 10 个点或关键点，或者分批处理)
            // 这里我们尝试处理所有点，但带有延迟
            const processedPoints: any[] = [];
            
            // 并发控制：每次处理 3 个
            const BATCH_SIZE = 3;
            for (let i = 0; i < nodesToGeocode.length; i += BATCH_SIZE) {
                const batch = nodesToGeocode.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (item) => {
                    let lat = item.originalLat;
                    let lng = item.originalLng;
                    let needsGeocoding = true;

                    // 验证 AI 坐标是否合理 (距离市中心 200km 以内)
                    if (lat && lng && destCenter.lat !== 0) {
                        const dist = getDistance(destCenter.lat, destCenter.lng, lat, lng);
                        if (dist < 200) {
                            needsGeocoding = false; // AI 坐标看起来是合理的，直接使用
                        } else {
                            console.warn(`AI coordinates for ${item.location} seem far (${dist.toFixed(0)}km), re-geocoding...`);
                        }
                    }

                    if (needsGeocoding) {
                        try {
                            // 加上城市名以提高准确度，并限制语言为中文
                            const query = `${destination} ${item.location}`;
                            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=zh`, {
                                headers: { 'User-Agent': 'WeRoam-Travel-App/1.0' }
                            });
                            if (geoRes.ok) {
                                const geoData = await geoRes.json();
                                if (geoData && geoData.length > 0) {
                                    const newLat = parseFloat(geoData[0].lat);
                                    const newLng = parseFloat(geoData[0].lon);
                                    
                                    // 再次验证 Geocoding 结果是否合理
                                    if (destCenter.lat !== 0) {
                                        const dist = getDistance(destCenter.lat, destCenter.lng, newLat, newLng);
                                        if (dist < 200) {
                                            lat = newLat;
                                            lng = newLng;
                                            // 更新原始数据中的坐标，以便后续显示
                                            itineraryData.itinerary[item.dayIndex].nodes[item.nodeIndex].coordinates = { lat, lng };
                                        } else {
                                            console.warn(`Geocoding result for ${item.location} is too far (${dist.toFixed(0)}km), ignoring.`);
                                            // 如果 AI 也没给坐标，Geocoding 也跑偏了，那就只能用市中心了 (或者保持 undefined)
                                            if (!lat) {
                                                lat = destCenter.lat;
                                                lng = destCenter.lng;
                                            }
                                        }
                                    } else {
                                        // 如果没有市中心坐标作为参考，只能盲目信任 Geocoding
                                        lat = newLat;
                                        lng = newLng;
                                        itineraryData.itinerary[item.dayIndex].nodes[item.nodeIndex].coordinates = { lat, lng };
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn(`Geocoding failed for ${item.location}`, e);
                        }
                    }

                    if (lat && lng) {
                        processedPoints.push({
                            lat,
                            lng,
                            label: item.location
                        });
                    }
                }));
                // 简单的速率限制延迟
                await delay(1000);
            }

            if (processedPoints.length > 0) {
                setCurrentMapPoints(processedPoints);
                onRouteUpdate(destination, processedPoints);
            } else {
                // Fallback logic if absolutely no points found
                console.warn('No coordinates found, falling back to city center...');
                // ... existing fallback logic ...
                 try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`, {
                        headers: { 'User-Agent': 'WeRoam-Travel-App/1.0' }
                    });
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData && geoData.length > 0) {
                            const cityPoint = [{ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon), label: destination }];
                            setCurrentMapPoints(cityPoint);
                            onRouteUpdate(destination, cityPoint);
                        }
                    }
                } catch (e) { console.error(e); }
            }

            // 4. 构建 AI 回复文本
            const travelModeStr = Array.isArray(formData.travelMode) ? formData.travelMode.join('、') : formData.travelMode;
            const aiResponseText = `### ✅ WeRoam 智能定制：**${destination} ${daysGenerated}天** 路线\n\n` +
                `AI 已根据您的 **${formData.style.join('、')}** 偏好（**${formData.pace}** 节奏）生成了 **${daysGenerated}天** 的详细行程。\n` +
                `建议交通方式为 **${travelModeStr}**。\n\n` +
                `请点击下方卡片查看 **第一天** 路线，或打开【行程详情】查看完整 ${daysGenerated} 天路线。`;

            // 5. 更新消息 (非流式，直接替换)
            setMessages(prev => prev.map(m => m.id === msgId ? { 
                ...m, 
                content: aiResponseText, 
                isRoutePlan: true, 
                routeData: firstDayRoute, // 仅用于 RouteTimeline 卡片展示
                fullItinerary: itineraryData // 存储完整数据
            } : m));

            // 保存 AI 消息到后端（如果有会话）
            try {
                let activeSessionId = currentSessionId;

                // Ensure session exists
                if (!activeSessionId) {
                    const sRes = await fetch('/api/chat/sessions', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ 
                            title: `${destination} 行程规划`, // Use destination in title
                            destination: destination // Set destination initially
                        }) 
                    });
                    if (sRes.ok) {
                        const sData = await sRes.json();
                        activeSessionId = sData.id;
                        setCurrentSessionId(sData.id);
                    }
                } else {
                    // Update existing session with new destination
                    await fetch(`/api/chat/sessions/${activeSessionId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            destination: destination,
                            title: `${destination} 行程规划` // Optional: update title too
                        })
                    });
                }

                if (activeSessionId) {
                    // 序列化行程数据并附加到消息内容中（使用隐藏标记）
                    // 改为保存完整的 itineraryData 对象
                    const hiddenData = `\n\n<!--ITINERARY_DATA:${JSON.stringify(itineraryData)}-->`;
                    await fetch(`/api/chat/sessions/${activeSessionId}`, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ 
                            role: 'assistant', 
                            content: aiResponseText + hiddenData 
                        }) 
                    });
                }
            } catch (err) {
                console.warn('Failed to save AI message', err);
            }


        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '行程生成过程中发生未知错误。';
            console.error('API Error:', errorMsg, e);
            // 失败时，替换消息为错误提示
            setMessages(prev => prev.map(m => m.id === msgId ? { 
                ...m, 
                content: `### ❌ 错误\n行程生成失败：${errorMsg} \n\n**可能的原因:**\n- Qwen API Key 未正确配置（需在 .env.local 中设置）\n- Qwen API Endpoint 地址错误\n- Qwen 服务暂时不可用\n\n请检查后端日志了解更多信息。`,
            } : m));
        } finally {
            setIsTyping(false);
        }
    };


    // 用户发送消息处理 (包含意图识别)
    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }]);
        setInputText('');
        setIsTyping(true);

        let activeSessionId = currentSessionId;

        try {
            // 1. Ensure Session Exists
            if (!activeSessionId) {
                try {
                    const sRes = await fetch('/api/chat/sessions', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ title: text.slice(0, 20) }) 
                    });
                    if (sRes.ok) {
                        const sData = await sRes.json();
                        activeSessionId = sData.id;
                        setCurrentSessionId(activeSessionId);
                    }
                } catch (e) {
                    console.error('Failed to create session:', e);
                }
            }

            // 2. Save User Message
            if (activeSessionId) {
                try {
                    await fetch(`/api/chat/sessions/${activeSessionId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: 'user', content: text })
                    });
                } catch (e) {
                    console.error('Failed to save user message:', e);
                }
            }

            // 调用后端意图识别 API
            const res = await fetch('/api/chat/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    currentContext: prefilledData // Pass current context
                })
            });

            const data = await res.json();
            let aiContent = '';
            
            if (data.intent === 'PLANNING' || data.intent === 'GREETING' || data.intent === 'FEEDBACK') {
                // 1. Update Context with extracted data
                if (data.extractedData) {
                    const newData = { ...prefilledData, ...data.extractedData };
                    // Clean up null/undefined values
                    Object.keys(newData).forEach(key => {
                        if (newData[key as keyof TripFormData] === null || newData[key as keyof TripFormData] === undefined) {
                            delete newData[key as keyof TripFormData];
                        }
                    });
                    setPrefilledData(newData);

                    // Update parent if destination changed
                    if (data.extractedData.destination) {
                        onRouteUpdate(data.extractedData.destination, []);
                    }
                }

                // 2. Check for Trigger Generation
                if (data.triggerGeneration) {
                    // Check if we have minimum required info (Destination)
                    const finalData = { ...prefilledData, ...data.extractedData };
                    if (finalData.destination) {
                        // Construct full form data with defaults
                        const formData: TripFormData = {
                            destination: finalData.destination,
                            days: finalData.days || 3,
                            travellers: finalData.travellers || 2,
                            travelMode: finalData.travelMode || ['打车/网约车'],
                            style: finalData.style || ['文化探索'],
                            budget: finalData.budget || '中等',
                            pace: finalData.pace || '适中 (平衡)'
                        };
                        
                        // Call API
                        callItineraryAPI(formData);
                        aiContent = data.reply || `好的，正在为您生成 **${formData.destination}** 的 ${formData.days} 天行程...`;
                    } else {
                        aiContent = "我明白了您想生成行程，但我还不知道您想去哪里？请告诉我目的地。";
                    }
                } else {
                    // Just conversation
                    aiContent = data.reply || '收到。';
                }
            } else {
                // OTHER
                aiContent = data.reply || '抱歉，我没听懂。请告诉我您的旅行计划。';
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: aiContent,
                timestamp: new Date()
            }]);

            // 3. Save AI Message
            if (activeSessionId) {
                try {
                    await fetch(`/api/chat/sessions/${activeSessionId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: 'assistant', content: aiContent })
                    });
                } catch (e) {
                    console.error('Failed to save AI message:', e);
                }
            }

        } catch (error) {
            console.error('Intent check failed:', error);
            // Fallback: 简单的本地兜底回复
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: '网络连接似乎有点问题 📡。请直接点击 **“+ 精细规划”** 按钮来设置您的行程。',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFormSubmit = (formData: TripFormData) => {
        setIsFormOpen(false);
        // 调用真实的 API
        callItineraryAPI(formData); 
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border-4 border-yellow-200 overflow-hidden flex flex-col h-full relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
                <div className="flex items-center gap-2"><Sparkles /> <span>WeRoam 助手</span></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
                            {msg.type === 'ai' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src="/icon.png" alt="AI" className="w-full h-full object-cover" />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} 
                                    alt="User" 
                                    className="w-full h-full object-cover" 
                                />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                            msg.type === 'user' 
                                ? 'bg-yellow-100 text-gray-800 rounded-tr-none' 
                                : 'bg-white text-gray-800 rounded-tl-none'
                        }`}>
                            <ReactMarkdown components={customComponents}>{msg.content}</ReactMarkdown>
                            
                            {msg.isRoutePlan && msg.routeData && (
                                <div className="mt-4 pt-4 border-t border-gray-100/50">
                                    {/* RouteTimeline 组件预览第一天 */}
                                    <RouteTimeline 
                                        day={1} 
                                        nodes={processRouteNodes(msg.routeData)} 
                                        onClick={() => {
                                            // 点击卡片打开完整的 N 天行程 Modal
                                            if (msg.fullItinerary) {
                                                setCurrentRouteData(msg.fullItinerary);
                                                // 如果历史记录中有目的地信息，更新当前上下文
                                                if (msg.fullItinerary.destination && msg.fullItinerary.destination !== '未知目的地') {
                                                    setCurrentDestination(msg.fullItinerary.destination);
                                                }
                                                setIsItineraryOpen(true);
                                            } else if (msg.routeData) {
                                                // Fallback for very old data if any
                                                // 尝试从消息内容中提取目的地 (如果可能)
                                                // 格式通常是: "### ✅ WeRoam 智能定制：**目的地 N天** 路线"
                                                let extractedDest = '未知';
                                                const destMatch = msg.content.match(/智能定制：\*\*(.*?) \d+天\*\*/);
                                                if (destMatch && destMatch[1]) {
                                                    extractedDest = destMatch[1];
                                                    setCurrentDestination(extractedDest);
                                                }

                                                setCurrentRouteData({
                                                    destination: extractedDest,
                                                    itinerary: [{ day: 1, theme: '行程', nodes: msg.routeData }]
                                                });
                                                setIsItineraryOpen(true);
                                            }
                                        }}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => {
                                                if (msg.fullItinerary) {
                                                    setCurrentRouteData(msg.fullItinerary);
                                                    // 如果历史记录中有目的地信息，更新当前上下文
                                                    if (msg.fullItinerary.destination && msg.fullItinerary.destination !== '未知目的地') {
                                                        setCurrentDestination(msg.fullItinerary.destination);
                                                    }
                                                    setIsItineraryOpen(true);
                                                } else if (msg.routeData) {
                                                    let extractedDest = '未知';
                                                    const destMatch = msg.content.match(/智能定制：\*\*(.*?) \d+天\*\*/);
                                                    if (destMatch && destMatch[1]) {
                                                        extractedDest = destMatch[1];
                                                        setCurrentDestination(extractedDest);
                                                    }

                                                    setCurrentRouteData({
                                                        destination: extractedDest,
                                                        itinerary: [{ day: 1, theme: '行程', nodes: msg.routeData }]
                                                    });
                                                    setIsItineraryOpen(true);
                                                }
                                            }} 
                                            className="flex-1 py-2 bg-yellow-50 text-yellow-700 rounded-lg flex justify-center items-center gap-2 text-sm hover:bg-yellow-100 font-medium"
                                        >
                                            <FileText className="w-4 h-4" /> 行程详情
                                        </button>
                                        <button 
                                            onClick={() => setIsMapOpen(true)} 
                                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg flex justify-center items-center gap-2 text-sm hover:bg-blue-100"
                                        >
                                            <MapIcon className="w-4 h-4" /> 查看地图
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* AI 正在思考/加载状态 */}
                {isTyping && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icon.png" alt="AI" className="w-full h-full object-cover" />
                        </div>
                       <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center border border-gray-100">
                          <Loader2 className="w-4 h-4 mr-3 text-yellow-600 animate-spin" />
                          <span className="text-sm text-gray-500 mr-3">正在思考...</span>
                          <button onClick={stopGeneration} className="text-xs text-red-500 hover:text-red-700 flex items-center font-bold border-l border-gray-300 pl-3 ml-1">
                            <StopCircle className="w-4 h-4 mr-1" /> 停止
                          </button>
                       </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                {!user ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                        <p className="text-gray-500 text-sm">登录后即可使用 AI 智能规划功能</p>
                        <Link 
                            href="/login" 
                            className="px-6 py-2 bg-yellow-500 text-white text-sm font-medium rounded-full hover:bg-yellow-600 transition-colors shadow-sm"
                        >
                            立即登录
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setIsFormOpen(true)} className="text-sm flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-100">
                                <PlusCircle className="w-3 h-3" /> 精细规划
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                value={inputText} 
                                onChange={e => setInputText(e.target.value)} 
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isTyping ? "AI 正在思考中..." : "请输入目的地（例如：我想去上海）"}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                disabled={isTyping}
                            />
                            <button onClick={handleSendMessage} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600" disabled={isTyping}>
                                <Send className="w-5 h-5"/>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* ======================= MODALS ======================= */}
            
            {/* 行程详情 Modal */}
            {isItineraryOpen && currentRouteData && (
                <ItineraryModal 
                    // 传递完整的 itinerary 数组 (N天路线)。其类型为 DayItinerary[]
                    data={currentRouteData.itinerary as any} // 临时使用 as any，但您应在 ItineraryModal.tsx 中修复类型
                    destination={currentDestination}
                    onClose={() => setIsItineraryOpen(false)} 
                />
            )}
            
            {/* 地图 Modal */}
            {isMapOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4" onClick={() => setIsMapOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold">Day 1 路线地图 ({currentDestination})</h3>
                            <button onClick={() => setIsMapOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
                        </div>
                        <div className="flex-1 relative">
                            <DynamicMapComponent points={currentMapPoints} heightClass="h-full" /> 
                        </div>
                    </div>
                </div>
            )}

            {/* 表单 Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 z-[9997] flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden ring-0 border-0" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between p-4 border-b border-gray-100 bg-white">
                            <h4 className="font-bold text-lg text-gray-800">详细旅行偏好设置</h4>
                            <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="flex-grow overflow-y-auto bg-gray-50">
                            <TripPlanningForm 
                                onSubmit={handleFormSubmit} 
                                onClose={() => setIsFormOpen(false)} 
                                initialData={prefilledData} 
                            /> 
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}