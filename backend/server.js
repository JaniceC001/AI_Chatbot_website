// server.js

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // 允許來自任何來源的請求
app.use(express.json()); // 解析傳入的 JSON 請求

// 定義 API 端點
app.post('/api/chat', async (req, res) => {
    try {
        // 從前端請求的 body 中獲取資料
        const {
            apiKey,
            apiBaseUrl,
            modelName,
            systemPrompt,
            characterPrompt,
            history,
            contextLength,
            maxTokens
        } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API Key is required.' });
        }
        if (!modelName) {
            return res.status(400).json({ error: 'Model name is required.' });
        }
        if (!apiBaseUrl) {
            return res.status(400).json({ error: 'API URL is required.' });
        }

        // 使用從前端傳來的 API Key 初始化
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: apiBaseUrl,
        });

        // 組合 System Prompt 和 Character Prompt
        const fullSystemPrompt = `${systemPrompt}\n\n${characterPrompt}`;

        // API 的訊息歷史
        // 先放上系統提示 -> 從對話歷史中取出最新的 `contextLength` 筆對話
        const messagesToSend = [
            { role: 'system', content: fullSystemPrompt },
            ...history.slice(-contextLength) // 使用 slice 實現上下文長度控制
        ];

        // 3. 呼叫 API
        const completion = await openai.chat.completions.create({
            model: modelName, // 使用從前端傳來的模型名稱
            messages: messagesToSend,
            max_tokens: maxTokens,
        });
        
        // 將 AI 的回覆送回前端
        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('Error calling API:', error);
        res.status(500).json({ error: error.message || 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});