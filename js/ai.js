// js/ai.js - AI Assistant Chat Page Functionality

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const apiKeySection = document.getElementById("api-key-section");
    const chatSection = document.getElementById("chat-section");
    const apiKeyInput = document.getElementById("api-key-input");
    const btnSaveApiKey = document.getElementById("btn-save-api-key");
    const apiKeyStatusMsg = document.getElementById("api-key-status-msg");
    const chatMessagesContainer = document.getElementById("chat-messages-container");
    const chatInputText = document.getElementById("chat-input-text");
    const btnSendMessage = document.getElementById("btn-send-message");
    const btnClearChat = document.getElementById("btn-clear-chat");
    const btnExportChat = document.getElementById("btn-export-chat");
    const btnFloatingKeyConfig = document.getElementById("btn-floating-key-config");

    // Chat states
    let chatHistory = []; // format: { role: "user" | "model", parts: [{ text: "..." }] }
    let chatLogs = [];    // format: { timestamp: Date, sender: string, text: string }
    let isGenerating = false;

    // Load initial states
    initApiKey();

    // === API Key Management ===
    function initApiKey() {
        const key = localStorage.getItem("gemini_api_key");
        if (key) {
            apiKeySection.style.display = "none";
            chatSection.style.display = "flex";
            btnFloatingKeyConfig.style.display = "flex";
            // Set up initial system instruction log entry
            logSystemEvent("System initialized with stored API key.");
        } else {
            apiKeySection.style.display = "block";
            chatSection.style.display = "none";
            btnFloatingKeyConfig.style.display = "none";
        }
    }

    btnSaveApiKey.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            showApiKeyStatus("APIキーを入力してください。", "error");
            return;
        }
        if (!key.startsWith("AIzaSy")) {
            showApiKeyStatus("有効なGemini APIキーの形式ではありません (通常 AIzaSy で始まります)。", "error");
            return;
        }

        localStorage.setItem("gemini_api_key", key);
        showApiKeyStatus("APIキーを保存しました！開始します...", "success");
        setTimeout(() => {
            apiKeyInput.value = "";
            apiKeyStatusMsg.style.display = "none";
            initApiKey();
        }, 1000);
    });

    btnFloatingKeyConfig.addEventListener("click", () => {
        const confirmChange = confirm("登録されているAPIキーを変更または削除しますか？\n(OKを押すとキー設定画面に戻ります)");
        if (confirmChange) {
            localStorage.removeItem("gemini_api_key");
            initApiKey();
        }
    });

    function showApiKeyStatus(msg, type) {
        apiKeyStatusMsg.textContent = msg;
        apiKeyStatusMsg.style.color = type === "success" ? "#22c55e" : "#ef4444";
        apiKeyStatusMsg.style.display = "block";
    }

    // === Logging helper ===
    function logSystemEvent(msg) {
        console.log(`[AI System] ${msg}`);
    }

    // === Message Display ===
    function appendMessage(role, text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${role}`;

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        avatarDiv.innerHTML = role === "assistant" ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";

        // Convert links in the text to clickable HTML links
        contentDiv.innerHTML = formatResponseText(text);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessagesContainer.appendChild(messageDiv);

        // Auto scroll to bottom
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function formatResponseText(text) {
        // Basic escaping of HTML to prevent XSS
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Convert markdown link syntax: [link text](url) to HTML links
        escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Convert raw http/https urls to links (excluding those already in html attributes)
        const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/g;
        escaped = escaped.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

        return escaped;
    }

    // Show/Hide Typing Indicator
    function showTypingIndicator() {
        const indicatorDiv = document.createElement("div");
        indicatorDiv.className = "message assistant typing-indicator";
        indicatorDiv.id = "temp-typing-indicator";

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        avatarDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        indicatorDiv.appendChild(avatarDiv);
        indicatorDiv.appendChild(contentDiv);
        chatMessagesContainer.appendChild(indicatorDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById("temp-typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // === Gemini API Call ===
    async function sendMessageToGemini(userText) {
        if (isGenerating) return;
        isGenerating = true;

        // User message UI
        appendMessage("user", userText);
        chatLogs.push({ timestamp: new Date(), sender: "あなた", text: userText });

        // Add to API Chat History
        chatHistory.push({
            role: "user",
            parts: [{ text: userText }]
        });

        // Limit local context history memory (keep last 15 messages for context sanity)
        if (chatHistory.length > 15) {
            chatHistory = chatHistory.slice(-15);
        }

        showTypingIndicator();

        const apiKey = localStorage.getItem("gemini_api_key");
        if (!apiKey) {
            removeTypingIndicator();
            appendMessage("assistant", "エラー：APIキーが見つかりません。右下の鍵アイコンをクリックしてキーを設定してください。");
            isGenerating = false;
            return;
        }

        // Construct System Instruction (combines rules and compressed dataset)
        const thesisDatabaseText = typeof THESES_AI_TEXT !== "undefined" ? THESES_AI_TEXT : "（学位論文リストが読み込めませんでした。）";
        const systemPrompt = `
あなたは北陸先端科学技術大学院大学（JAIST）情報科学系・丹康雄教授の研究室の「AI研究アシスタント」です。
M1新入生が先輩方の研究を理解し、自分の研究テーマのアイデアを検討するのをサポートします。

【提供された過去の学位論文データ】
以下は2000年度から2026年度までの修士・博士学位論文の一覧です：
${thesisDatabaseText}

【応答ガイドライン】
1. 必ず日本語で、親切かつ丁寧に回答してください。
2. 相談者が興味を持っているテーマ、または入力したキーワードに関連する先輩の論文を、具体的に論文タイトル・著者名・年度を含めて紹介してください。紹介する際は、リストにあるDSpaceリンク（URL）を [登録情報](URL) または生のリンク形式で含めて案内してください。
3. このシステムは論文タイトル・著者名・発表年度・キーワードなどの公開された「書誌情報」のみを参照しており、論文本体の全文や要旨の内容までは読み込んでいない点を、時折優しく説明に含めてください。
4. 回答の末尾には、以下の免責事項を必ず明記してください。
   「※AIの回答は参考意見です。出力された提案やアイデアを基に研究テーマを決定する際は、必ず指導教員（丹教授）に相談し合意を得てください。」
5. データベースにない分野や無関係のテーマについて尋ねられた場合は、「当研究室のデータベースには該当する論文はありませんが、一般的な研究アプローチとしては...」と前置きして説明してください。
        `.trim();

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: chatHistory,
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => ({}));
                throw new Error(errorJson.error?.message || `HTTP error ${response.status}`);
            }

            const resJson = await response.json();
            const aiResponseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

            removeTypingIndicator();

            if (aiResponseText) {
                appendMessage("assistant", aiResponseText);
                chatLogs.push({ timestamp: new Date(), sender: "AIアシスタント", text: aiResponseText });
                
                // Add response to model history
                chatHistory.push({
                    role: "model",
                    parts: [{ text: aiResponseText }]
                });
            } else {
                appendMessage("assistant", "エラー：AIから応答メッセージを取得できませんでした。応答フォーマットを確認してください。");
            }

        } catch (error) {
            logSystemEvent(`Request failed: ${error.message}`);
            removeTypingIndicator();
            appendMessage("assistant", `エラーが発生しました：\n${error.message}\n\nAPIキーが有効であるか、またネットワーク状態をご確認ください。`);
        } finally {
            isGenerating = false;
        }
    }

    // Input handlers
    btnSendMessage.addEventListener("click", () => {
        const text = chatInputText.value.trim();
        if (!text) return;
        chatInputText.value = "";
        sendMessageToGemini(text);
    });

    chatInputText.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            btnSendMessage.click();
        }
    });

    // Make suggestion chips clickable
    window.sendSuggestion = (suggestionText) => {
        if (isGenerating) return;
        sendMessageToGemini(suggestionText);
    };

    // Clear Chat
    btnClearChat.addEventListener("click", () => {
        if (confirm("チャット履歴をクリアしますか？\n(メモリ上の会話コンテキストもリセットされます)")) {
            chatHistory = [];
            chatLogs = [];
            chatMessagesContainer.innerHTML = `
                <div class="message assistant">
                    <div class="avatar"><i class="fa-solid fa-robot"></i></div>
                    <div class="message-content">
                        チャットをリセットしました！<br>
                        研究テーマ選定に関する新しい質問や相談をお待ちしています。
                    </div>
                </div>
            `;
            logSystemEvent("Chat cleared.");
        }
    });

    // === Export Chat Log (Monthly Text File) ===
    btnExportChat.addEventListener("click", () => {
        if (chatLogs.length === 0) {
            alert("保存する対話履歴がありません。");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const filename = `${year}${month}_tan-lab_chat.txt`;

        let logContent = `==================================================\n`;
        logContent += `  丹研究室 AIアシスタント 対話ログ\n`;
        logContent += `  作成日時: ${now.toLocaleString("ja-JP")}\n`;
        logContent += `==================================================\n\n`;

        chatLogs.forEach((log) => {
            const timeStr = log.timestamp.toLocaleTimeString("ja-JP", { hour12: false });
            logContent += `[${timeStr}] ${log.sender}:\n`;
            logContent += `${log.text}\n`;
            logContent += `--------------------------------------------------\n\n`;
        });

        // Trigger file download
        const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        logSystemEvent(`Exported chat log: ${filename}`);
    });
});
