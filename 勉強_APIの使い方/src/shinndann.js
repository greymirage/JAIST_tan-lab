const formEl = document.getElementById("diagnosis-form");
const resetButtonEl = document.getElementById("reset-button");
const resultTitleEl = document.getElementById("result-title");
const resultTextEl = document.getElementById("result-text");
const llmStatusEl = document.getElementById("llm-status");
const answerCountEl = document.getElementById("answer-count");

const LLM_API_ENDPOINT = window.LLM_API_ENDPOINT || "/api/gemini";

function getRadioValue(formData, name) {
  return formData.get(name) || "";
}

function collectAnswers() {
  const formData = new FormData(formEl);

  return {
    userName: formData.get("userName").trim(),
    condition: getRadioValue(formData, "condition"),
    workStyle: getRadioValue(formData, "workStyle"),
    weekend: getRadioValue(formData, "weekend"),
    stuckStyle: getRadioValue(formData, "stuckStyle"),
    friendRole: getRadioValue(formData, "friendRole"),
    freeText: formData.get("freeText").trim(),
  };
}

function countAnswers(answers) {
  return Object.values(answers).filter((value) => value !== "").length;
}

function updateAnswerCount(answers) {
  answerCountEl.textContent = `${countAnswers(answers)} / 7`;
}

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

回答:
名前: ${answers.userName || "未入力"}
研究室に入った瞬間の様子: ${answers.condition}
締切が近いときの動き方: ${answers.workStyle}
週末の回復アイテム: ${answers.weekend}
作業で詰まったときの反応: ${answers.stuckStyle}
友人から見た役割: ${answers.friendRole}
最近の自分について: ${answers.freeText || "未入力"}
`;
}

async function requestGoogleDiagnosis(answers) {
  const response = await fetch(LLM_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: buildPrompt(answers),
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 320,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("LLM API request failed.");
  }

  const data = await response.json();
  return data;
}

function createLocalDiagnosis(answers) {
  const name = answers.userName || "あなた";
  const text = [
    answers.condition,
    answers.workStyle,
    answers.weekend,
    answers.stuckStyle,
    answers.friendRole,
    answers.freeText,
  ].join(" ");

  if (text.includes("友人") || text.includes("話") || text.includes("距離感")) {
    return {
      title: `${name}は「キャンパス・コネクター」タイプ`,
      body:
        "人と話すことで考えが整理されるタイプです。今日は短い相談や雑談をきっかけに、次の行動を決めると流れに乗れます。",
    };
  }

  if (text.includes("疲") || text.includes("再起動") || text.includes("散歩")) {
    return {
      title: `${name}は「北陸リセット」タイプ`,
      body:
        "無理に走り続けるより、環境を少し変えると力が戻るタイプです。15分だけ外を歩いてから作業に戻るのがおすすめです。",
    };
  }

  if (text.includes("作って") || text.includes("話題") || text.includes("アイデア")) {
    return {
      title: `${name}は「プロトタイプ職人」タイプ`,
      body:
        "考える前に小さく作ることで調子が出るタイプです。完璧を狙う前に、まず10分で動く形を作ってみましょう。",
    };
  }

  return {
    title: `${name}は「静かな集中エンジン」タイプ`,
    body:
      "落ち着いた場所で深く考えるほど強さが出るタイプです。今日の最初の30分だけ通知を切ると成果が見えやすくなります。",
  };
}

function splitLlmResult(result, answers) {
  if (!result) {
    return createLocalDiagnosis(answers);
  }

  if (result.title && result.body) {
    return {
      title: result.title,
      body: result.body,
    };
  }

  const text = result.text || "";
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: lines[0] || "LLM診断結果",
    body: lines.slice(1).join("\n") || text,
  };
}

function validateAnswers(answers) {
  if (
    !answers.condition ||
    !answers.workStyle ||
    !answers.weekend ||
    !answers.stuckStyle ||
    !answers.friendRole
  ) {
    return "5つの質問すべてに回答してください。";
  }

  return "";
}

async function handleSubmit(event) {
  event.preventDefault();

  const answers = collectAnswers();
  const errorMessage = validateAnswers(answers);
  updateAnswerCount(answers);

  if (errorMessage) {
    resultTitleEl.textContent = "未回答があります";
    resultTextEl.textContent = errorMessage;
    llmStatusEl.textContent = "待機中";
    return;
  }

  resultTitleEl.textContent = "AI診断中...";
  resultTextEl.textContent = "回答をもとにAIが診断を作成しています。";
  llmStatusEl.textContent = "AI診断中";

  try {
    const llmText = await requestGoogleDiagnosis(answers);
    const diagnosis = splitLlmResult(llmText, answers);
    resultTitleEl.textContent = diagnosis.title;
    resultTextEl.textContent = diagnosis.body;
    llmStatusEl.textContent = "Google Gemini";
  } catch (error) {
    console.warn("LLM request failed. Falling back to local diagnosis.", error);
    const diagnosis = createLocalDiagnosis(answers);
    resultTitleEl.textContent = diagnosis.title;
    resultTextEl.textContent = diagnosis.body;
    llmStatusEl.textContent = "ローカル診断";
  }
}

function handleReset() {
  formEl.reset();
  resultTitleEl.textContent = "入力後に診断できます";
  resultTextEl.textContent = "質問に答えて「診断する」を押すと、ここに結果が表示されます。";
  llmStatusEl.textContent = "Google Gemini 構造を準備済み";
  updateAnswerCount(collectAnswers());
}

formEl.addEventListener("submit", handleSubmit);
resetButtonEl.addEventListener("click", handleReset);
formEl.addEventListener("change", () => updateAnswerCount(collectAnswers()));
formEl.addEventListener("input", () => updateAnswerCount(collectAnswers()));
