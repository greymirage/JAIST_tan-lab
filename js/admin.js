// Normalization map
const KEYWORD_NORMALIZE = {
    // === スマートホーム ===
    "smarthome": "スマートホーム",
    "smart home": "スマートホーム",
    "smart homes": "スマートホーム",
    "smart house": "スマートホーム",
    "smart home environment": "スマートホーム",
    "aiops for smart homes": "スマートホーム",

    // === IoT ===
    "internet of things": "IoT",
    "iot (internet of things)": "IoT",
    "iot（モノのインターネット）": "IoT",

    // === ホームネットワーク ===
    "home network": "ホームネットワーク",
    "home network system": "ホームネットワーク",
    "home networks": "ホームネットワーク",
    "homenetwork": "ホームネットワーク",
    "ホームネットワークシステム": "ホームネットワーク",
    "integrated home network service": "ホームネットワーク",
    "home service platform": "ホームネットワーク",

    // === デジタルツイン ===
    "digital twin": "デジタルツイン",
    "digital twins": "デジタルツイン",

    // === メタデータ ===
    "metadata": "メタデータ",

    // === シミュレーション ===
    "simulation": "シミュレーション",
    "large-scale simulation": "シミュレーション",
    "simulation integration": "シミュレーション",

    // === マルチエージェントシミュレーション ===
    "multi-agent simulation": "マルチエージェントシミュレーション",
    "community simulator": "コミュニティシミュレータ",

    // === CPS（サイバーフィジカルシステム）===
    "cyber-physical system": "CPS",
    "cyber-physical systems": "CPS",
    "cyber physical system": "CPS",
    "cyber physical systems": "CPS",
    "サイバーフィジカルシステム": "CPS",

    // === センサネットワーク ===
    "sensor networks": "センサネットワーク",
    "sensor network": "センサネットワーク",
    "wireless sensor network": "センサネットワーク",
    "wireless sensor networks": "センサネットワーク",

    // === HEMS / EMS ===
    "home energy management system": "HEMS",
    "hems": "HEMS",
    "energy management system": "EMS",
    "エネルギーマネジメントシステム": "EMS",
    "cems": "CEMS",

    // === テストベッド ===
    "testbed": "テストベッド",
    "network testbed": "テストベッド",
    "distributed testbed": "テストベッド",

    // === ネットワーク実験 ===
    "network experiment": "ネットワーク実験",
    "network emulation": "ネットワークエミュレーション",
    "emulation": "エミュレーション",

    // === セキュリティ ===
    "security": "セキュリティ",
    "secured communication": "セキュリティ",
    "network security": "ネットワークセキュリティ",
    "cyber security": "サイバーセキュリティ",
    "cybersecurity": "サイバーセキュリティ",

    // === ホームシミュレータ ===
    "home simulator": "ホームシミュレータ",

    // === ECHONET Lite ===
    "echonetlite": "ECHONET Lite",
    "echonet lite": "ECHONET Lite",
    "エコーネットライト": "ECHONET Lite",

    // === ユビキタス ===
    "ubiquitous computing": "ユビキタスコンピューティング",
    "ubiquitous networks": "ユビキタスネットワーク",
    "pervasive computing": "ユビキタスコンピューティング",

    // === SDN / OpenFlow ===
    "software defined network": "SDN",
    "software defined networking": "SDN",

    // === ルーティング ===
    "routing algorithm": "ルーティング",
    "adaptive routing": "ルーティング",
    "multipath routing": "マルチパスルーティング",
    "multipath": "マルチパスルーティング",
    "potential routing": "ルーティング",
    "overlay network": "オーバーレイネットワーク",

    // === 機械学習 ===
    "machine learning based network management": "機械学習",

    // === 異常検知 ===
    "anomaly detection": "異常検知",

    // === プライバシー ===
    "privacy preservation": "プライバシー保護",
    "privacy-policy management": "プライバシー保護",

    // === 人間行動認識 ===
    "human activity recognition": "行動認識",
    "activity recognition framework": "行動認識",
    "activity of daily living": "行動認識",
};

function cleanKeyword(kw) {
    kw = kw.trim();
    const kwLower = kw.toLowerCase();
    if (KEYWORD_NORMALIZE[kwLower]) {
        return KEYWORD_NORMALIZE[kwLower];
    }
    return kw;
}

// State variables
let customTheses = [];
const baseTheses = typeof THESES_DATA !== 'undefined' ? THESES_DATA : [];

// Load custom data from localStorage
function loadCustomData() {
    try {
        const stored = localStorage.getItem("custom_theses");
        if (stored) {
            customTheses = JSON.parse(stored);
        } else {
            customTheses = [];
        }
    } catch (e) {
        console.error(e);
        customTheses = [];
    }

    // Deduplicate: Filter out custom theses that are already integrated in base data.js
    const filteredCustom = customTheses.filter(ct => {
        const isDuplicate = baseTheses.some(bt => {
            if (ct.uri && bt.uri && ct.uri.toLowerCase().trim() === bt.uri.toLowerCase().trim()) {
                return true;
            }
            if (ct.title && bt.title && ct.author && bt.author &&
                ct.title.toLowerCase().trim() === bt.title.toLowerCase().trim() &&
                ct.author.toLowerCase().trim() === bt.author.toLowerCase().trim()) {
                return true;
            }
            return false;
        });
        return !isDuplicate;
    });

    // Automatically clean up localStorage if duplicates were found
    if (filteredCustom.length !== customTheses.length) {
        customTheses = filteredCustom;
        try {
            localStorage.setItem("custom_theses", JSON.stringify(customTheses));
        } catch (e) {
            console.error("Failed to clean up localStorage", e);
        }
    }

    updateCustomListUI();
}

function saveCustomData() {
    localStorage.setItem("custom_theses", JSON.stringify(customTheses));
    updateCustomListUI();
}

// Render Custom List
function updateCustomListUI() {
    document.getElementById("custom-count").textContent = customTheses.length;
    const tbody = document.getElementById("custom-list-body");
    tbody.innerHTML = "";

    if (customTheses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">インポートされたカスタム論文はありません。</td></tr>`;
        return;
    }

    customTheses.forEach((t, index) => {
        const tr = document.createElement("tr");
        
        const badgeClass = t.degree_type === "博士" ? "badge-phd" : "badge-master";
        const degreeBadge = `<span class="badge ${badgeClass}">${t.degree_type || '修士'}</span>`;

        tr.innerHTML = `
            <td style="width: 80px; text-align: center;">${degreeBadge}</td>
            <td style="width: 80px; text-align: center;">${t.year ? t.year + '年度' : '不明'}</td>
            <td style="font-weight: 700;">${t.title}</td>
            <td style="width: 150px;">${t.author}</td>
            <td style="width: 80px; text-align: center;">
                <a class="action-link" onclick="handleDeleteSingle(${index})"><i class="fa-solid fa-trash-can"></i> 削除</a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Message banner helper
function showMessage(msg, type) {
    const el = document.getElementById("admin-message");
    el.textContent = msg;
    el.style.display = "block";
    if (type === "green") {
        el.style.background = "#d1fae5";
        el.style.color = "#065f46";
        el.style.border = "1px solid #10b981";
    } else {
        el.style.background = "#fee2e2";
        el.style.color = "#991b1b";
        el.style.border = "1px solid #f87171";
    }
}

// Parser
function handleImport() {
    const inputVal = document.getElementById("admin-html-input").value.trim();
    if (!inputVal) {
        showMessage("インポートするHTMLテーブルのコードを入力してください。", "red");
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(inputVal, 'text/html');
    const tables = doc.querySelectorAll('table.itemDisplayTable');
    
    if (tables.length === 0) {
        showMessage("有効な <table class=\"itemDisplayTable\"> 要素が見見つかりませんでした。コードを確認してください。", "red");
        return;
    }

    const parsedList = [];
    
    tables.forEach(table => {
        const thesis = {
            title: "",
            author: "",
            author_ruby: "",
            keywords: [],
            date: "",
            year: null,
            supervisor: "",
            title_en: "",
            author_en: "",
            language: "",
            uri: "",
            collection: "",
            degree_type: "修士", // Default fallback
            degree_name: "",
            grant_number: "",
            grant_date: ""
        };

        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const labelTd = row.querySelector('td.metadataFieldLabel');
            const valueTd = row.querySelector('td.metadataFieldValue');
            if (!labelTd || !valueTd) return;

            const label = labelTd.textContent.replace(/:/g, '').replace(/\u00a0/g, '').trim();
            let valText = valueTd.textContent.trim();

            if (label === "タイトル") {
                thesis.title = valText;
            } else if (label === "著者") {
                thesis.author = valText;
            } else if (label === "著者（別表記）") {
                thesis.author_ruby = valText;
            } else if (label === "キーワード") {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = valueTd.innerHTML;
                tempDiv.querySelectorAll('br').forEach(br => br.replaceWith(','));
                const kws = tempDiv.textContent.replace(/\n/g, ',').split(',');
                const cleanedKws = [];
                kws.forEach(k => {
                    k = k.trim();
                    if (k) cleanedKws.push(cleanKeyword(k));
                });
                thesis.keywords = [...new Set(cleanedKws)];
            } else if (label === "発行日") {
                thesis.date = valText;
                const match = valText.match(/\d{4}/);
                if (match) thesis.year = parseInt(match[0]);
            } else if (label === "記述") {
                const svMatch = valText.match(/Supervisor:\s*([^\n\r,;]+)/i);
                if (svMatch) {
                    thesis.supervisor = svMatch[1].replace(/　/g, ' ').trim().replace(/先端科学.*/, '');
                } else {
                    const svMatch2 = valText.match(/Supervisor:\s*([^\n\r]+)/i);
                    if (svMatch2) {
                        thesis.supervisor = svMatch2[1].split('<br')[0].split('\n')[0].replace(/　/g, ' ').trim().replace(/先端科学.*/, '');
                    }
                }

                // Determine degree_type from description
                if (valText.includes("博士")) {
                    thesis.degree_type = "博士";
                } else if (valText.includes("修士")) {
                    thesis.degree_type = "修士";
                }
            } else if (label === "タイトル（英語）") {
                thesis.title_en = valText;
            } else if (label === "著者（英語）") {
                thesis.author_en = valText;
            } else if (label === "言語") {
                thesis.language = valText;
            } else if (label === "URI") {
                const a = valueTd.querySelector('a');
                thesis.uri = a ? a.href : valText;
            } else if (label.includes("出現コレクション")) {
                thesis.collection = valText;
            } else if (label === "学位名") {
                thesis.degree_name = valText;
                thesis.degree_type = "博士";
            } else if (label === "学位授与番号") {
                thesis.grant_number = valText;
            } else if (label === "学位授与年月日") {
                thesis.grant_date = valText;
            }
        });

        if (!thesis.supervisor) thesis.supervisor = "丹 康雄";
        if (thesis.keywords.length === 0) thesis.keywords = ["未登録"];

        parsedList.push(thesis);
    });

    customTheses = [...customTheses, ...parsedList];
    saveCustomData();
    document.getElementById("admin-html-input").value = "";
    showMessage(`${parsedList.length} 件のデータを正常にインポートしました！`, "green");
}

// Delete handlers
function handleDeleteSingle(index) {
    if (confirm("この論文を削除しますか？")) {
        customTheses.splice(index, 1);
        saveCustomData();
        showMessage("選択した論文を削除しました。", "green");
    }
}

function handleClearAll() {
    if (confirm("インポートされたすべてのカスタム論文データを削除しますか？ (元の data.js の基本データは消えません)")) {
        customTheses = [];
        saveCustomData();
        showMessage("すべてのカスタムデータを削除しました。", "green");
    }
}

// Export combined data.js
function handleExport() {
    // Merge base data with custom data
    const fullDataset = [...baseTheses, ...customTheses];
    
    // Clean/remove any temp properties if they exist
    const cleanDataset = fullDataset.map(t => {
        const copy = {...t};
        delete copy.theme;
        return copy;
    });

    const jsContent = "const THESES_DATA = " + JSON.stringify(cleanDataset, null, 2) + ";\n";
    const blob = new Blob([jsContent], {type: "application/javascript;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage("統合された data.js を出力しました。現在のフォルダの data/data.js に上書き保存してください。", "green");
}

// Initialize
loadCustomData();
