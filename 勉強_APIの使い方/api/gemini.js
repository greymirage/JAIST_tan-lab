const GOOGLE_LLM_CONFIG = {
  apiKey: process.env.GOOGLE_LLM_API_KEY,
  model: process.env.GOOGLE_LLM_MODEL || "gemini-2.0-flash",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function requestGemini(prompt, generationConfig) {
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
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: generationConfig || {
        temperature: 0.8,
        maxOutputTokens: 320,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

module.exports = async function geminiHandler(request, response) {
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

    if (!body.prompt) {
      sendJson(response, 400, { error: "prompt is required." });
      return;
    }

    const text = await requestGemini(body.prompt, body.generationConfig);
    sendJson(response, 200, { text });
  } catch (error) {
    sendJson(response, 500, { error: "Gemini proxy request failed." });
  }
};
