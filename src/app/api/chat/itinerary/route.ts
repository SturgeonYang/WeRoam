// src/app/api/chat/itinerary/route.ts
import { NextResponse } from 'next/server';

// 从环境变量中获取 API 密钥和 Endpoint
const API_KEY = process.env.QWEN_API_KEY;
const API_ENDPOINT = process.env.QWEN_API_ENDPOINT; 

// 定义前端传来的数据结构
interface ItineraryRequest {
    destination: string;
    days: number;
    travelMode: string | string[]; // 兼容字符串或数组
    style: string[];
    budget: string;
    pace: string;
}

// 推断活动类型的辅助函数
function inferActivityType(activity: any): string {
    if (!activity) return 'spot';
    const text = (activity.activity || activity.description || activity.location || '').toLowerCase();
    if (text.includes('食') || text.includes('餐') || text.includes('早餐') || text.includes('午餐') || text.includes('晚餐')) {
        return 'food';
    }
    if (text.includes('休') || text.includes('酒店') || text.includes('住')) {
        return 'rest';
    }
    return 'spot';
}

// 计算两点间距离 (Haversine formula)
function calculateDistance(lat1: any, lng1: any, lat2: any, lng2: any): number {
    const nLat1 = parseFloat(lat1);
    const nLng1 = parseFloat(lng1);
    const nLat2 = parseFloat(lat2);
    const nLng2 = parseFloat(lng2);

    if (isNaN(nLat1) || isNaN(nLng1) || isNaN(nLat2) || isNaN(nLng2)) {
        return NaN;
    }

    const R = 6371; // km
    const dLat = (nLat2 - nLat1) * Math.PI / 180;
    const dLng = (nLng2 - nLng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(nLat1 * Math.PI / 180) * Math.cos(nLat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 根据距离和模式估算时间
function estimateDuration(distanceKm: number, mode: string): string {
    if (isNaN(distanceKm) || distanceKm < 0) return '约30分钟'; // Fallback

    let speed = 30; // km/h default (car)
    if (mode.includes('步行') || mode.includes('Walk')) speed = 4; // 步行稍慢一点
    else if (mode.includes('地铁') || mode.includes('公交')) speed = 25; // 包含停站
    else if (mode.includes('自驾') || mode.includes('打车')) speed = 35; // 城市路况
    
    const hours = distanceKm / speed;
    const minutes = Math.round(hours * 60);
    
    // 加上一些缓冲时间 (等车、步行到站等)
    const buffer = mode.includes('步行') ? 0 : 10; 
    const totalMinutes = minutes + buffer;

    if (isNaN(totalMinutes)) return '约30分钟';

    if (totalMinutes < 10) return '约10分钟';
    if (totalMinutes > 60) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return m > 0 ? `约${h}小时${m}分钟` : `约${h}小时`;
    }
    return `约${totalMinutes}分钟`;
}

export async function POST(req: Request) {
    console.log('Itinerary API called');
    
    if (!API_KEY || !API_ENDPOINT) {
        const errorMsg = 'Missing config: API_KEY or API_ENDPOINT not set';
        console.error(errorMsg);
        return new NextResponse(
            JSON.stringify({ error: 'API key or Endpoint not configured', details: errorMsg }),
            { status: 500 }
        );
    }

    try {
        const { destination, days, travelMode, style, budget, pace }: ItineraryRequest = await req.json();
        
        // 处理 travelMode，确保它是字符串用于 Prompt
        const travelModeStr = Array.isArray(travelMode) ? travelMode.join('、') : (travelMode || '不限');

        // 解析允许的交通方式关键词
        const allowedModes: string[] = [];
        const rawModes = Array.isArray(travelMode) ? travelMode : [travelMode || '不限'];
        
        if (rawModes.includes('不限')) {
            allowedModes.push('自驾', '打车', '地铁', '公交', '步行');
        } else {
            rawModes.forEach(m => {
                if (m.includes('自驾') || m.includes('租车')) allowedModes.push('自驾');
                if (m.includes('打车') || m.includes('网约车')) allowedModes.push('打车');
                if (m.includes('公交') || m.includes('地铁')) { allowedModes.push('地铁'); allowedModes.push('公交'); }
                if (m.includes('步行') || m.includes('CityWalk')) allowedModes.push('步行');
            });
        }
        // 兜底
        if (allowedModes.length === 0) allowedModes.push('打车');

        console.log('Request params:', { destination, days, travelMode: travelModeStr, style, budget, pace });

        // 1. 定义 Qwen 必须返回的 JSON 结构
        const JSON_SCHEMA = {
            type: "object",
            properties: {
                destination: { type: "string", description: "旅行目的地城市名" },
                itinerary: {
                    type: "array",
                    description: `包含${days}天的详细行程安排`,
                    items: {
                        type: "object",
                        properties: {
                            day: { type: "integer", description: "行程的第几天 (从1开始)" },
                            theme: { type: "string", description: "当日主题 (如：历史文化探索)" },
                            nodes: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        time: { type: "string", description: "活动开始时间，格式HH:MM" },
                                        location: { type: "string", description: "**真实的、著名的景点或餐厅名称**" },
                                        coordinates: {
                                            type: "object",
                                            description: "该地点的经纬度坐标（非常重要，用于地图渲染）",
                                            properties: {
                                                lat: { type: "number", description: "纬度，如 39.9042" },
                                                lng: { type: "number", description: "经度，如 116.4074" }
                                            },
                                            required: ["lat", "lng"]
                                        },
                                        type: { type: "string", enum: ["spot", "food", "rest"], description: "地点类型" },
                                        description: { type: "string", description: "地点介绍或建议活动内容" },
                                        transport: {
                                            type: "object",
                                            description: "前往下一个地点的交通方式（最后一个地点不需要）",
                                            properties: {
                                                mode: { type: "string", description: "简短交通方式，如：地铁1号线、打车、自驾" },
                                                duration: { type: "string", description: "预估耗时，如：20分钟。**必须提供估算时间，严禁使用'未知'或'待定'**。" },
                                                cost: { type: "string", description: "预估费用（可选），如：5元" },
                                                description: { type: "string", description: "详细、准确的导航描述。必须根据交通方式生成真实路线。例如：'沿中山路向东行驶2公里，右转进入人民路' 或 '乘坐地铁2号线（往浦东国际机场方向），在南京东路站下车（2号口出）'。" }
                                            },
                                            required: ["mode", "duration"]
                                        },
                                    },
                                    required: ["time", "location", "type", "description"],
                                },
                            },
                        },
                        required: ["day", "theme", "nodes"],
                    },
                },
            },
            required: ["destination", "itinerary"],
        };

        // 2. 构造 Prompt
        const systemPrompt = `你是一个专业的旅行规划 AI 助手，现在你需要根据用户的偏好，生成一个完整的、多日的旅行行程。
请严格遵守以下规则：
1. **必须**生成一个符合 JSON Schema 的响应。
2. **必须**生成完整的 ${days} 天行程。
3. **必须**使用**真实的、著名的**地点名称 (景点、餐厅)，不能使用占位符或通用名称。
4. **必须**提供每个地点的**准确经纬度坐标**（coordinates字段），这是地图渲染的关键，**绝对不能省略**，且必须是该地点的真实坐标。如果不知道确切坐标，请根据地名进行估算，但必须在合理范围内。
5. **必须**根据用户的【交通偏好】（${travelModeStr}）生成相邻地点之间的**详细、准确的交通方案**（transport字段）：
   - **严禁瞎编乱造**。如果不知道具体路线，请给出通用的准确建议。
   - **严格限制交通方式**：transport.mode 字段的内容**必须**包含在用户选择的偏好中（${allowedModes.join('、')}）。例如用户只选了“步行”，你就不能安排“打车”或“地铁”。
   - 若用户选“自驾”：请提供真实的道路名称和行驶方向，例如“沿延安高架路行驶...”。
   - 若用户选“地铁/公交”：**必须**提供真实存在的地铁线路号和站点名称，例如“乘坐地铁2号线至南京东路站”。
   - 若用户选“打车”：请提供合理的打车预估费用。
   - **关于时间**：交通耗时（duration）必须是具体的估算值（如“约30分钟”），**绝对不能**返回“未知”、“待定”或空字符串。如果不确定，请根据两地距离进行合理估算（例如：步行1km约15分钟，驾车5km约15分钟）。
6. **所有**用户偏好（节奏、预算、交通）都必须体现在行程的安排中。
7. **时间安排必须自然且多样化**：
   - **避免机械的整点时间**（如 9:00, 10:00, 11:00）。请使用更自然的时间点（如 9:15, 10:40, 14:20）。
   - **避免每天的时间表雷同**。不要让每一天的行程都从完全相同的时间开始或结束。
   - 必须根据景点游玩时长（通常2-3小时）、用餐时长（1-1.5小时）以及交通耗时，精确计算每个节点的开始时间。
8. **用餐时间**：午餐安排在 11:30-13:00 之间，晚餐安排在 17:30-19:30 之间。
9. **路线规划原则**：必须遵循“就近原则”。同一天的景点应当在地理位置上相邻，避免折返跑。请合理规划游览顺序，使总路程最短。
10. **行程丰富度与差异化**：
   - **每一天的地点数量应当有所变化**，不要每天都固定是 4 个或 5 个。根据当天的游玩强度，在 3 到 6 个地点之间自然浮动。
   - **绝对禁止**出现“自由活动”、“全天自由安排”、“酒店休息”、“自由探索”或类似的空白行程。
   - 如果是最后一天，请安排具体的“伴手礼购买地”（如某某步行街）或“送机/送站”前的短途游览。
   - 如果不知道安排什么，请推荐具体的**购物中心、公园、博物馆或特色街道**的名字，绝不允许留白。
11. **严格遵守天数**：用户指定了 ${days} 天，你就必须严格生成 ${days} 天的行程，**绝对不能**多生成或少生成。
12. 使用中文回答。`;

        const userPrompt = `目的地：${destination}
天数：${days} 天
旅行风格：${style.join('、')}
旅行节奏：${pace}
交通偏好：${travelModeStr}
预算等级：${budget}
请根据以上信息，生成详细的、完整的 JSON 格式的旅行行程。`;

        // 3. 调用 Qwen API
        console.log('Calling Qwen API...');
        const qwenRes = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'qwen-turbo', 
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!qwenRes.ok) {
             const errorText = await qwenRes.text();
             console.error("Qwen API Error Status:", qwenRes.status);
             console.error("Qwen API Error Response:", errorText);
             return new NextResponse(
                JSON.stringify({ error: 'Qwen API 调用失败', details: errorText, status: qwenRes.status }),
                { status: 500 }
            );
        }

        const qwenData = await qwenRes.json();
        const rawJsonContent = qwenData.choices?.[0]?.message?.content;

        if (!rawJsonContent) {
            return new NextResponse(
                JSON.stringify({ error: 'Qwen 未返回有效的 JSON 内容' }),
                { status: 500 }
            );
        }

        // 4. 解析并返回 Qwen 结果
        // 修复：去除可能存在的 Markdown 代码块标记
        const cleanJsonContent = rawJsonContent.replace(/```json\n?|```/g, '').trim();
        
        let parsedData;
        try {
            parsedData = JSON.parse(cleanJsonContent);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.error("Raw Content:", rawJsonContent);
            return new NextResponse(
                JSON.stringify({ error: 'AI 返回的数据不是有效的 JSON', details: rawJsonContent }),
                { status: 500 }
            );
        }

        // 标准化数据结构
        let normalizedItinerary;
        
        // 辅助函数：尝试从对象中提取行程数组
        const findItineraryArray = (obj: any): any[] | null => {
            if (!obj) return null;
            if (Array.isArray(obj.itinerary)) return obj.itinerary;
            if (Array.isArray(obj.days)) return obj.days;
            if (Array.isArray(obj.daily_itinerary)) return obj.daily_itinerary;
            if (Array.isArray(obj.schedule)) return obj.schedule;
            return null;
        };

        let itineraryArray = findItineraryArray(parsedData);
        if (!itineraryArray && parsedData.trip) {
            itineraryArray = findItineraryArray(parsedData.trip);
        }

        if (itineraryArray) {
            // 强制截断多余的天数 (Fix: 用户请求1天却返回6天的问题)
            if (itineraryArray.length > days) {
                console.warn(`AI returned ${itineraryArray.length} days, truncating to ${days} days.`);
                itineraryArray = itineraryArray.slice(0, days);
            }

            normalizedItinerary = {
                destination: parsedData.destination || parsedData.trip?.destination || destination,
                itinerary: itineraryArray.map((dayData: any, dayIndex: number) => {
                    const activities = dayData.activities || dayData.nodes || dayData.schedule || dayData.events || [];
                    
                    const nodes = Array.isArray(activities) ? activities.map((activity: any, actIndex: number) => {
                        if (!activity) return null;
                        
                        // 预先计算默认交通方式 (使用允许列表中的第一个作为默认值)
                        const defaultMode = allowedModes[0];

                        // 动态计算兜底时长
                        let fallbackDuration = '约30分钟';
                        if (actIndex < activities.length - 1) {
                             const nextActivity = activities[actIndex + 1];
                             // 只有当当前节点和下一个节点都有坐标时，才能计算
                             if (activity.coordinates && nextActivity && nextActivity.coordinates) {
                                 try {
                                     const dist = calculateDistance(
                                         activity.coordinates.lat, activity.coordinates.lng,
                                         nextActivity.coordinates.lat, nextActivity.coordinates.lng
                                     );
                                     fallbackDuration = estimateDuration(dist, defaultMode);
                                 } catch (e) {
                                     console.warn('Distance calc failed', e);
                                 }
                             }
                        }

                        // 处理交通信息
                        let transport = undefined;
                        if (activity.transport) {
                            if (typeof activity.transport === 'object') {
                                let mode = activity.transport.mode;
                                // 严格校验：如果 AI 返回的 mode 不在允许列表中，强制替换为默认值
                                if (!mode || mode === '交通' || !allowedModes.some(am => mode.includes(am))) {
                                    mode = defaultMode;
                                }

                                transport = {
                                    mode: mode,
                                    duration: activity.transport.duration || fallbackDuration,
                                    cost: activity.transport.cost,
                                    description: activity.transport.description
                                };
                            } else if (typeof activity.transport === 'string') {
                                transport = {
                                    mode: defaultMode,
                                    duration: activity.transport
                                };
                            }
                        } else if (activity.transportToNext) {
                             let mode = activity.transportToNext.mode;
                             if (!mode || !allowedModes.some(am => mode.includes(am))) {
                                mode = defaultMode;
                             }
                             transport = {
                                mode: mode,
                                duration: activity.transportToNext.duration || fallbackDuration
                            };
                        } else if (actIndex < activities.length - 1) {
                            // 默认值
                            transport = {
                                mode: defaultMode,
                                duration: fallbackDuration,
                                cost: '待定'
                            };
                        } else {
                            // 最后一个节点：添加返程/结束信息
                            transport = {
                                mode: '行程结束',
                                duration: '',
                                description: '结束当天的精彩旅程，返回住宿地休息。'
                            };
                        }

                        return {
                            time: activity.time || '09:00',
                            location: activity.location || activity.activity || activity.name || activity.place || '未知地点',
                            type: activity.type || inferActivityType(activity),
                            description: activity.description || activity.detail || activity.intro || '',
                            coordinates: activity.coordinates || undefined,
                            transport: transport
                        };
                    }).filter((node: any) => {
                        // 过滤掉无效节点和“自由活动”类节点
                        if (!node || !node.location) return false;
                        const badKeywords = ['自由活动', '自由探索', '原地解散', '待定', '无安排'];
                        return !badKeywords.some(kw => node.location.includes(kw));
                    }) : [];
                    
                    return {
                        day: dayData.day || dayData.dayNumber || (dayIndex + 1),
                        theme: dayData.theme || dayData.title || dayData.summary || `第${dayData.day || dayIndex + 1}天`,
                        nodes: nodes.length > 0 ? nodes : [
                            { 
                                time: '09:00', 
                                location: `${destination} 市中心/地标游览`, 
                                type: 'spot' as const, 
                                description: '参观当地市中心核心区域及周边著名地标建筑，体验当地风情。'
                            }
                        ]
                    };
                })
            };
        } else {
            console.error('Unrecognized data format:', parsedData);
            throw new Error('无法识别 Qwen 返回的行程格式');
        }

        return new NextResponse(
            JSON.stringify({ 
                success: true, 
                data: normalizedItinerary 
            }),
            { status: 200 }
        );

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        console.error('Itinerary Generation Error:', errorMsg);
        return new NextResponse(
            JSON.stringify({ error: `生成失败: ${errorMsg}`, details: errorMsg }),
            { status: 500 }
        );
    }
}
