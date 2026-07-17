// js/ai.js - Minimal Q&A Assistant Chat Logic

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const chatMessagesContainer = document.getElementById("chat-messages-container");
    const chatInputText = document.getElementById("chat-input-text");
    const btnSendMessage = document.getElementById("btn-send-message");
    const btnClearChat = document.getElementById("btn-clear-chat");
    const btnExportChat = document.getElementById("btn-export-chat");

    // Chat states
    let chatHistory = []; // format: { role: "user" | "model", parts: [{ text: "..." }] }
    let chatLogs = [];    // format: { timestamp: Date, sender: string, text: string }
    let isGenerating = false;

    // Verify API Key from config.js
    const apiKey = typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : "YOUR_API_KEY_HERE";
    const isApiKeyConfigured = apiKey && apiKey !== "YOUR_API_KEY_HERE" && apiKey.trim() !== "";

    if (!isApiKeyConfigured) {
        appendSystemWarning("警告: プロジェクトルートの `config.js` 内の API キーが正しく設定されていません。`config.js` を開き、有効な Gemini API キーを設定してください。");
    }

    // === Message Display ===
    function appendMessage(role, text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${role}`;

        const labelDiv = document.createElement("div");
        labelDiv.className = "sender-label";
        labelDiv.textContent = role === "assistant" ? "アシスタント" : "質問";

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = formatResponseText(text);

        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);
        chatMessagesContainer.appendChild(messageDiv);

        // Auto scroll
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function appendSystemWarning(text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message assistant";

        const labelDiv = document.createElement("div");
        labelDiv.className = "sender-label";
        labelDiv.textContent = "システム";

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.style.borderColor = "#f87171";
        contentDiv.style.background = "#fef2f2";
        contentDiv.style.color = "#991b1b";
        contentDiv.innerHTML = formatResponseText(text);

        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);
        chatMessagesContainer.appendChild(messageDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function formatResponseText(text) {
        // Escape HTML
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Convert markdown link: [text](url)
        escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Convert raw URLs
        const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/g;
        escaped = escaped.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

        return escaped;
    }

    // Show/Hide Typing Indicator
    function showTypingIndicator() {
        const indicatorDiv = document.createElement("div");
        indicatorDiv.className = "message assistant typing-indicator";
        indicatorDiv.id = "temp-typing-indicator";

        const labelDiv = document.createElement("div");
        labelDiv.className = "sender-label";
        labelDiv.textContent = "アシスタント";

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        indicatorDiv.appendChild(labelDiv);
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
        if (!isApiKeyConfigured) {
            appendSystemWarning("警告: `config.js` の `GEMINI_API_KEY` を設定するまで、メッセージを送信できません。");
            return;
        }

        isGenerating = true;

        // User message UI
        appendMessage("user", userText);
        chatLogs.push({ timestamp: new Date(), sender: "質問", text: userText });

        // Add to history
        chatHistory.push({
            role: "user",
            parts: [{ text: userText }]
        });

        if (chatHistory.length > 15) {
            chatHistory = chatHistory.slice(-15);
        }

        showTypingIndicator();

        const thesisDatabaseText = typeof THESES_AI_TEXT !== "undefined" ? THESES_AI_TEXT : "（データ未読込）";
        
        // Custom system instruction for clean academic style
        const systemPrompt = `
あなたは北陸先端科学技術大学院大学（JAIST）情報科学系・丹康雄教授の研究室の「研究アシスタント」です。
M1新入生が先輩方の研究を理解し、自分の研究テーマのアイデアを検討するのをサポートします。

【提供された過去の学位論文データ】
以下は2000年度から2026年度までの修士・博士学位論文の一覧です：
${thesisDatabaseText}

【応答ガイドライン】
1. 必ず日本語で、親切かつ学術的に丁寧に回答してください。
2. 相談者が興味を持っているテーマ、または入力したキーワードに関連する先輩の論文を、具体的に論文タイトル・著者名・年度を含めて紹介してください。紹介する際は、リストにあるDSpaceリンク（URL）を [登録情報](URL) または生のリンク形式で含めて案内してください。
3. このシステムは論文タイトル・著者名・発表年度・キーワードなどの公開された「書誌情報」のみを参照しており、論文本体の全文や要旨の内容までは読み込んでいない点を、時折優しく説明に含めてください。
4. 回答の末尾には、以下の免責事項を必ず明記してください。
   「※AIの回答は参考用です。最終的な研究テーマ決定には必ず指導教員（丹教授）への相談と合意が必要です。」
5. データベースにない分野や無関係のテーマについて尋ねられた場合は、「当研究室のデータベースには該当する論文はありませんが、一般的なアプローチとしては...」と前置きして説明してください。
        `.trim();

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
                chatLogs.push({ timestamp: new Date(), sender: "アシスタント", text: aiResponseText });
                
                chatHistory.push({
                    role: "model",
                    parts: [{ text: aiResponseText }]
                });
            } else {
                appendMessage("assistant", "エラー：AIから応答メッセージを取得できませんでした。");
            }

        } catch (error) {
            console.error(error);
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
        if (confirm("対話履歴をクリアしますか？")) {
            chatHistory = [];
            chatLogs = [];
            chatMessagesContainer.innerHTML = `
                <div class="message assistant">
                    <div class="sender-label">アシスタント</div>
                    <div class="message-content">
                        対話履歴をリセットしました。研究テーマ選定に関する新しい質問や相談をお待ちしています。
                    </div>
                </div>
            `;
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
        logContent += `  丹研究室 論文データ Q&A アシスタント 対話ログ\n`;
        logContent += `  作成日時: ${now.toLocaleString("ja-JP")}\n`;
        logContent += `==================================================\n\n`;

        chatLogs.forEach((log) => {
            const timeStr = log.timestamp.toLocaleTimeString("ja-JP", { hour12: false });
            logContent += `[${timeStr}] ${log.sender}:\n`;
            logContent += `${log.text}\n`;
            logContent += `--------------------------------------------------\n\n`;
        });

        // Trigger download
        const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    });
});
