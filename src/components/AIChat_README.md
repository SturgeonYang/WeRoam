# 🤖 AI 聊天功能集成 (通义千问 Qwen)

本项目使用 Next.js 的 Route Handler 结合阿里云 **通义千问（Qwen）API** 实现了流式（Streaming）聊天功能。为确保兼容性，我们采用了 Qwen 提供的 **OpenAI 兼容模式** Endpoint。

## 🚀 核心技术点

  * **模型服务:** 阿里云 DashScope 灵积模型服务 (通义千问)。
  * **后端实现:** Next.js Route Handler (`/api/chat/route.ts`)。
  * **交互模式:** 流式传输 (Server-Sent Events / SSE)。
  * **兼容性:** 使用 OpenAI 兼容 Endpoint，保证了请求体和响应格式的通用性。

## 🔑 环境配置 (必读)

要使 AI 聊天功能在本地或线上环境中工作，你必须配置以下两个环境变量：

1.  **获取 Key:** 前往阿里云 DashScope 平台创建并获取你的 API Key（以 `sk-` 开头）。
2.  **配置环境文件:** 在你的项目根目录下创建 **`.env.local`** 文件，并添加以下配置：

<!-- end list -->

```env
# 阿里云通义千问 API 密钥
QWEN_API_KEY=sk-你的真实密钥粘贴在这里

# 通义千问 OpenAI 兼容模式的 HTTP 请求地址
QWEN_API_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

> **重要提示:** `.env.local` 文件已添加到 `.gitignore`，请勿将你的真实密钥提交到 GitHub。部署到 Vercel 或其他平台时，请在**平台的环境变量设置页面**手动添加这两个变量。

## 💡 代码实现说明

### 1\. 后端 Route Handler (`src/app/api/chat/route.ts`)

这个文件是 API 调用的核心。它负责接收前端请求，构造 Qwen API 要求的请求体，并将 Qwen 返回的流式数据直接转发给前端。

  * **兼容模式请求体:** 请求体严格遵循 OpenAI 的 Chat Completions 格式，包含 `model`、`messages` 和 `stream: true` 字段。
  * **流式转发:** 使用 `fetch` API 发起请求，并将响应的 `response.body` (ReadableStream) 直接作为 `NextResponse` 返回，实现了高效的流式数据转发。

### 2\. 前端组件 (`src/components/AIChat.tsx`)

该组件负责管理用户界面、消息历史，并处理流式数据的解析。

  * **流式解析:** 使用 `ReadableStreamReader` 处理后端返回的 SSE 数据。
  * **关键修正:** 修复了在解析流数据时，遇到流终止标记 **`[DONE]`** 导致的 `SyntaxError: "[DONE]" is not valid JSON` 错误。前端现在会检查并忽略该标记，确保流能正常结束。
  * **增量提取:** 针对兼容模式，增量文本从 `data.choices[0].delta.content` 字段中提取。

## 常见问题与解决

错误信息,原因,解决方案
404 Not Found,QWEN_API_ENDPOINT 地址拼写错误，或服务地址已变更。,严格核对 .env.local 中的 QWEN_API_ENDPOINT 地址是否正确。
400 Bad Request,API 请求体结构错误，通常是 messages 字段丢失或格式不正确。,确保 route.ts 中的 qwenPayload 包含正确的 model、messages 数组和 stream: true 字段。
500 Internal Server Error,服务器端代码运行时错误，常见于 API_KEY 或 API_ENDPOINT 未成功加载。,检查 .env.local 文件名是否正确，并确保在修改后重启了 npm run dev。
TypeError: Failed to fetch (部署后),线上部署环境缺少 QWEN_API_KEY 或 QWEN_API_ENDPOINT 环境变量。,登录你的部署平台（如 Vercel），手动添加这两个环境变量并重新部署。
