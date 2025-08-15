// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const apiKeyInput = document.getElementById('api-key');
    const apiBaseUrlInput = document.getElementById('api-base-url');
    const modelNameInput = document.getElementById('model-name');
    const systemPromptInput = document.getElementById('system-prompt');
    const characterPromptInput = document.getElementById('character-prompt');
    const contextLengthValue = document.getElementById('context-length-value');
    const maxTokensValue = document.getElementById('max-tokens-value');
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat');
    const changeBgColor = document.getElementById('change-background');
    const contextLengthSlider = document.getElementById('context-length-slider');
    const contextLengthInput = document.getElementById('context-length-input');
    const maxTokensSlider = document.getElementById('max-tokens-slider');
    const maxTokensInput = document.getElementById('max-tokens-input');

    // 對話歷史記錄
    let conversationHistory = [];

    // --- 設定 sessionStorage ---
    // 暫時存取, 每次開網頁都要輸入 => sessionStorage
    // 只在當前瀏覽器分頁的生命週期中有效，關閉分頁或瀏覽器後就會清除。
    // 如果想在關閉瀏覽器後還能保留 > localStorage。
    apiKeyInput.value = sessionStorage.getItem('apiKey') || '';
    
    apiKeyInput.addEventListener('input', () => {
        sessionStorage.setItem('apiKey', apiKeyInput.value);
    });


    // 清除對話紀錄
    clearChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        chatHistory.innerHTML = '';
        displayMessage('ai', '對話紀錄已清除。');
    });

    // 主題切換列表
    const themes = ['light', 'dark', 'green'];
    let currentThemeIndex = 0;

    // 應用指定的主題
    function applyTheme(themeName) {
        // 在 body 標籤上加上對應的 class，例如 'dark-theme'
        document.body.className = `${themeName}-theme`; 
        // 將選擇的主題儲存到 localStorage，以便下次打開時保留
        localStorage.setItem('chatTheme', themeName);
        // 更新當前主題的索引
        currentThemeIndex = themes.indexOf(themeName);
    }

    changeBgColor.addEventListener('click', () => {
        // 計算下一個主題的索引，使用 % 實現循環
        const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
        const nextThemeName = themes[nextThemeIndex];
        applyTheme(nextThemeName);
    });

    // 發送訊息
    const sendMessage = async () => {
        const userMessage = userInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const apiBaseUrl = apiBaseUrlInput.value.trim();
        const modelName = modelNameInput.value.trim();

        if (!userMessage) return;
        if (!apiKey) {
            alert('請先輸入你的 API Key！');
            return;
        }
        if (!modelName) {
            alert('請輸入模型名稱！');
            return;
        }
        if (!apiBaseUrl) {
            alert('請輸入API URL！');
            return;
        }

        // 在畫面上顯示使用者訊息
        displayMessage('user', userMessage);
        conversationHistory.push({ role: 'user', content: userMessage });
        userInput.value = ''; // 清空輸入框

        // 顯示 "思考中..."
        const loadingMessage = displayMessage('loading', '思考中...');

        try {
            // 呼叫後端 API
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: apiKey,
                    apiBaseUrl: apiBaseUrl,
                    modelName: modelName,
                    systemPrompt: systemPromptInput.value,
                    characterPrompt: characterPromptInput.value,
                    history: conversationHistory,
                    contextLength: parseInt(contextLengthInput.value, 10),
                    maxTokens: parseInt(maxTokensInput.value, 10),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '請求失敗');
            }

            const data = await response.json();
            const aiReply = data.reply;

            // 移除 "思考中..." 並顯示 AI 回覆
            chatHistory.removeChild(loadingMessage);
            displayMessage('ai', aiReply);
            conversationHistory.push({ role: 'assistant', content: aiReply });

        } catch (error) {
            // 處理錯誤
            chatHistory.removeChild(loadingMessage);
            displayMessage('ai', `發生錯誤: ${error.message}`);
        }
    };

    // 在畫面上顯示訊息
    const displayMessage = (sender, message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = message;
        chatHistory.appendChild(messageElement);
        // 自動滾動到最底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return messageElement;
    };

    // 輸入框自動增高
    userInput.addEventListener('input', () => {
        // 高度重設
        userInput.style.height = 'auto';
        // 設置為內容的實際高度 (scrollHeight)
        userInput.style.height = `${userInput.scrollHeight}px`;
    });

     // 同步滑桿和數字輸入框
    function setupSliderSync(slider, numberInput) {
        //調整css的
        /*
        function updateSliderVisual() {
            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);
            const value = parseInt(slider.value, 10);

            // 計算%
            const percentage = ((value - min) / (max - min)) * 100;
            
            // 設定為 CSS 變數
            slider.style.setProperty('--progress-percent', `${percentage}%`);
        }
        */

        // 兩組數值同步
        numberInput.value = slider.value;
        //updateSliderVisual();

        // 拖動滑桿更新數字
        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            //updateSliderVisual();
        });

        // 數字輸入更新滑桿
        numberInput.addEventListener('input', () => {
            slider.value = numberInput.value;
            //updateSliderVisual();
        });

        // 防止輸入超出 min/max 範圍
        numberInput.addEventListener('change', () => {
            let value = parseInt(numberInput.value, 10);
            const min = parseInt(slider.min, 10);
            const max = parseInt(slider.max, 10);

            if (isNaN(value)) value = min;
            if (value < min) value = min;
            if (value > max) value = max;

            numberInput.value = value;
            slider.value = value; // 同步滑桿
            //updateSliderVisual();
        });
    }

    // 同步
    setupSliderSync(contextLengthSlider, contextLengthInput);
    setupSliderSync(maxTokensSlider, maxTokensInput);

    // 事件監聽
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        // 按下 Enter 但沒有按 Shift 時，發送訊息
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 防止換行
            sendMessage();
        }
    });
});