const GOOGLE_LLM_CONFIG = {
  apiKey: process.env.GOOGLE_LLM_API_KEY,
  model: process.env.GOOGLE_LLM_MODEL || "gemini-2.0-flash",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
};

function buildPrompt(answers) {
  return `
あなたは日本語で回答する診断メーカーです。
以下の回答をもとに、JAIST学生向けのオリジナル診断を作ってください。
占いや医学診断ではなく、楽しい自己理解コンテンツとして書いてください。

条件:
- タイトルを1行で出す
- 診断文は120文字以内
- 明日からできる小さなアドバイスを1つ入れる
- 口調は明るく、具体的にする
- 出力はJSONだけにする

JSON形式:
{
  "title": "診断タイトル",
  "body": "診断文とアドバイス"
}

回答:
名前: ${answers.userName || "未入力"}
今日のコンディション: ${answers.condition || "未回答"}
作業スタイル: ${answers.workStyle || "未回答"}
週末の過ごし方: ${answers.weekend || "未回答"}
重視したい方向: ${answers.diagnosisType || "未回答"}
最近の自分について: ${answers.freeText || "未入力"}
`;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function requestGemini(answers) {
  const url = `${GOOGLE_LLM_CONFIG.endpoint}/${GOOGLE_LLM_CONFIG.model}:generateContent?key=${GOOGLE_LLM_CONFIG.apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(answers) }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 320,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text);
}

module.exports = async function diagnosisHandler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!GOOGLE_LLM_CONFIG.apiKey) {
    sendJson(response, 500, { error: "GOOGLE_LLM_API_KEY is not configured." });
    return;
  }

  try {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const diagnosis = await requestGemini(body.answers || {});
    sendJson(response, 200, diagnosis);
  } catch (error) {
    sendJson(response, 500, { error: "Diagnosis generation failed." });
  }
};
