import { NextResponse } from 'next/server';

const API_KEY = process.env.QWEN_API_KEY;
const API_ENDPOINT = process.env.QWEN_API_ENDPOINT;

export async function POST(req: Request) {
    if (!API_KEY || !API_ENDPOINT) {
        return NextResponse.json({ error: 'API config missing' }, { status: 500 });
    }

    try {
        const { message, currentContext } = await req.json();

        const prompt = `
        你是一个智能旅行助手的意图识别引擎。请分析用户的输入，结合当前的上下文信息，返回一个 JSON 对象。
        
        当前已知信息 (Context): ${JSON.stringify(currentContext || {})}
        用户输入: "${message}"

        任务：
        1. 识别用户的意图 (intent)。
        2. 提取旅行相关的参数 (destination, days, budget, style, pace, travelMode)。
        3. 判断用户是否请求立即生成行程 (triggerGeneration)。

        可能的意图 (intent):
        - "PLANNING": 用户正在提供或更新旅行计划信息。
        - "GREETING": 打招呼。
        - "FEEDBACK": 反馈。
        - "OTHER": 其他。

        提取规则：
        - destination: 地点/城市。
        - days: 天数 (数字)。
        - budget: 预算 (经济型/中等/奢华)。
        - style: 风格 (文化探索/自然风光/美食/特种兵/休闲等)。
        - pace: 节奏 (快/适中/慢)。
        - travelMode: 交通方式 (自驾/打车/地铁/公交/步行)。
        - triggerGeneration: 如果用户明确表示“生成行程”、“开始规划”、“就这样吧”、“好的，做吧”等意思，设为 true。

        返回格式 (JSON):
        {
            "intent": "PLANNING" | "GREETING" | "FEEDBACK" | "OTHER",
            "extractedData": {
                "destination": string | null,
                "days": number | null,
                "budget": string | null,
                "style": string[] | null,
                "pace": string | null,
                "travelMode": string[] | null
            },
            "triggerGeneration": boolean,
            "reply": "根据当前状态生成的回复。如果缺少关键信息(如目的地)，请在回复中询问。如果用户请求生成但缺少目的地，请提示。如果即将生成，请回复'好的，正在为您生成...'。"
        }

        示例 1:
        Context: {}
        输入: "我想去上海玩3天"
        输出: { 
            "intent": "PLANNING", 
            "extractedData": { "destination": "上海", "days": 3 }, 
            "triggerGeneration": false, 
            "reply": "收到，去上海玩3天。您对预算或旅行风格有什么要求吗？" 
        }

        示例 2:
        Context: { "destination": "上海", "days": 3 }
        输入: "预算中等，喜欢美食"
        输出: { 
            "intent": "PLANNING", 
            "extractedData": { "budget": "中等", "style": ["美食探索"] }, 
            "triggerGeneration": false, 
            "reply": "好的，中等预算的美食之旅。我已经了解了您的目的地、天数、预算和风格。如果您没有其他要求，请告诉我“生成行程”或“开始规划”，我将为您生成详细安排。" 
        }

        示例 3:
        Context: { "destination": "上海", "days": 3, "budget": "中等" }
        输入: "帮我生成吧"
        输出: { 
            "intent": "PLANNING", 
            "extractedData": {}, 
            "triggerGeneration": true, 
            "reply": "好的，正在为您生成上海的3天行程，请稍候..." 
        }

        请仅返回 JSON 字符串，不要包含 Markdown 格式。
        `;

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "qwen-turbo", // 使用与 itinerary 相同的模型
                messages: [
                    { role: "system", content: "You are a helpful assistant that outputs JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Qwen API Error:', response.status, errText);
            throw new Error(`Qwen API call failed: ${response.status}`);
        }

        const data = await response.json();
        // 兼容 OpenAI 格式的响应结构
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('No content in response');
        }
        
        // 清理可能存在的 Markdown 代码块标记
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(jsonStr);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Intent recognition failed:', error);
        return NextResponse.json({ 
            intent: 'OTHER', 
            destination: null, 
            reply: '抱歉，我暂时无法理解您的意思，请直接告诉我您想去的目的地。' 
        });
    }
}
