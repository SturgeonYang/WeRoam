import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// 从环境变量中获取 API 密钥和 Endpoint
const API_KEY = process.env.QWEN_API_KEY;
const API_ENDPOINT = process.env.QWEN_API_ENDPOINT;

// 定义请求体结构
interface RequestBody {
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[];
    sessionId?: number;
}

// Helper function to generate a smart title
async function generateSmartTitle(content: string, apiKey: string, apiEndpoint: string): Promise<string> {
    try {
        console.log('Generating smart title for:', content.slice(0, 50));
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "qwen-turbo",
                messages: [
                    { role: 'system', content: '请根据用户的输入，总结一个简短的对话标题（不超过10个字），不要包含标点符号。' },
                    { role: 'user', content: content }
                ],
                stream: false
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            const title = data.choices[0]?.message?.content?.trim();
            console.log('Generated title:', title);
            // Remove any quotes if present
            return title ? title.replace(/['"《》]/g, '') : '';
        } else {
            console.error('Title generation failed:', await response.text());
        }
    } catch (error) {
        console.error('Failed to generate title:', error);
    }
    return '';
}

export async function POST(req: Request) {
    if (!API_KEY || !API_ENDPOINT) {
        return new NextResponse(
            JSON.stringify({ error: 'API key or Endpoint not configured.' }),
            { status: 500 }
        );
    }

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId: number | null = null;
    if (token) {
        const payload = await verifyToken(token);
        if (payload) userId = payload.userId;
    }

    try {
        const { messages, sessionId: requestedSessionId }: RequestBody = await req.json();
        const lastUserMessage = messages[messages.length - 1];

        let sessionId: number | null = null;

        if (userId && lastUserMessage.role === 'user') {
            if (requestedSessionId) {
                // Verify ownership
                const session = await prisma.chatSession.findUnique({
                    where: { id: requestedSessionId }
                });
                if (session && session.userId === userId) {
                    sessionId = session.id;
                    await prisma.chatSession.update({
                        where: { id: sessionId },
                        data: { updatedAt: new Date() }
                    });
                }
            }

            if (!sessionId) {
                // Generate smart title
                let title = lastUserMessage.content.slice(0, 20);
                if (API_KEY && API_ENDPOINT) {
                     const smartTitle = await generateSmartTitle(lastUserMessage.content, API_KEY, API_ENDPOINT);
                     if (smartTitle) {
                         title = smartTitle;
                     }
                }

                // Create new session
                const newSession = await prisma.chatSession.create({
                    data: { 
                        userId, 
                        title: title || '新对话' 
                    }
                });
                sessionId = newSession.id;
            }

            // Save User Message
            await prisma.chatMessage.create({
                data: {
                    sessionId,
                    role: 'user',
                    content: lastUserMessage.content
                }
            });
        }

        // 确保 qwenPayload 结构只包含模型、消息和流设置
        const qwenPayload = {
            model: "qwen-turbo", // 确保模型名称正确
            messages: messages,  // 关键：这是 API 要求的消息数组
            stream: true,        // 启用流式传输
        };

        // 发送请求到通义千问 API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 关键 Header
                'Authorization': `Bearer ${API_KEY}`,
            },
            // 关键：确保 body 被正确地 JSON 字符串化
            body: JSON.stringify(qwenPayload), 
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('通义千问 API Error:', errorText);
            return new NextResponse(
                JSON.stringify({ error: 'Failed to fetch from Qwen API', details: errorText }),
                { status: response.status }
            );
        }

        // Intercept stream to save AI response
        const decoder = new TextDecoder();
        let aiContent = '';

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            // Save AI Message to DB if logged in
                            if (userId && sessionId && aiContent) {
                                try {
                                    await prisma.chatMessage.create({
                                        data: {
                                            sessionId,
                                            role: 'assistant',
                                            content: aiContent
                                        }
                                    });
                                } catch (e) {
                                    console.error('Failed to save AI message:', e);
                                }
                            }
                            controller.close();
                            break;
                        }

                        // Accumulate content
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.slice(6).trim();
                                if (dataStr === '[DONE]') continue;
                                try {
                                    const data = JSON.parse(dataStr);
                                    const content = data.choices?.[0]?.delta?.content || '';
                                    aiContent += content;
                                } catch (e) {
                                    // ignore partial json
                                }
                            }
                        }

                        controller.enqueue(value);
                    }
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        // 返回流式响应给前端
        return new NextResponse(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Session-Id': sessionId ? sessionId.toString() : '',
            },
        });

    } catch (error) {
        console.error('Internal Server Error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
