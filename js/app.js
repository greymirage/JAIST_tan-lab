// 1. LocalStorage Custom Theses Handling
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
    "home-network": "ホームネットワーク",
    "ホームネットワークシステム": "ホームネットワーク",
    "integrated home network service": "ホームネットワーク",
    "home service platform": "ホームネットワーク",
    "home network simulation": "ホームネットワーク",

    // === デジタルツイン ===
    "digital twin": "デジタルツイン",
    "digital twins": "デジタルツイン",

    // === メタデータ ===
    "metadata": "メタデータ",

    // === シミュレーション ===
    "simulation": "シミュレーション",
    "large-scale simulation": "シミュレーション",
    "simulation integration": "シミュレーション",
    "simulate": "シミュレーション",
    "iot area network simulation": "シミュレーション",

    // === マルチエージェント / コミュニティシミュレータ ===
    "multi-agent simulation": "マルチエージェントシミュレーション",
    "community simulator": "コミュニティシミュレータ",
    "home environment simulator": "ホームシミュレータ",

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
    "ワイヤレスセンサーネットワーク": "センサネットワーク",

    // === HEMS / EMS / CEMS ===
    "home energy management system": "HEMS",
    "hems": "HEMS",
    "energy management system": "EMS",
    "エネルギーマネジメントシステム": "EMS",
    "cems": "CEMS",

    // === テストベッド ===
    "testbed": "テストベッド",
    "network testbed": "テストベッド",
    "distributed testbed": "テストベッド",
    "large scale testbed": "テストベッド",
    "large-scale testbed": "テストベッド",

    // === ネットワーク実験 / エミュレーション ===
    "network experiment": "ネットワーク実験",
    "network emulation": "ネットワークエミュレーション",
    "emulation": "エミュレーション",

    // === ストリーミング ===
    "streaming": "ストリーミング",
    "stream": "ストリーミング",

    // === ビデオネットワーク ===
    "video network": "ビデオネットワーク",
    "video-network": "ビデオネットワーク",
    "videonetwork": "ビデオネットワーク",

    // === 資源管理 ===
    "resource management": "資源管理",
    "network resource management": "ネットワーク資源管理",
    "resource management agent": "資源管理エージェント",

    // === 遠隔教育 ===
    "distance education": "遠隔教育",

    // === 相互接続 ===
    "interconnection": "相互接続",
    "interconnectio": "相互接続",
    "interconnecti": "相互接続",

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
    "machine learning": "機械学習",
    "machine learning based network management": "機械学習",

    // === 異常検知 ===
    "anomaly detection": "異常検知",
    "indoor climate anomaly detection": "異常検知",

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

let customTheses = [];
try {
    const stored = localStorage.getItem("custom_theses");
    if (stored) {
        customTheses = JSON.parse(stored);
    }
} catch (e) {
    console.error("Failed to parse custom theses", e);
}

const baseTheses = typeof THESES_DATA !== 'undefined' ? THESES_DATA : [];

// Filter out custom theses that are already integrated in base data.js
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

// Automatically clean up localStorage if duplicates were found (meaning they are now baked into data.js)
if (filteredCustom.length !== customTheses.length) {
    customTheses = filteredCustom;
    try {
        localStorage.setItem("custom_theses", JSON.stringify(customTheses));
    } catch (e) {
        console.error("Failed to update localStorage", e);
    }
}

// Global Variables
window.ALL_DATA = [...baseTheses, ...customTheses];
window.ALL_DATA.forEach(t => {
    if (!t.degree_type) t.degree_type = "修士";
});

window.yearlyChartInstance = null;
window.keywordChartInstance = null;
window.currentViewMode = 'card';

// Init UI components
window.addEventListener('DOMContentLoaded', () => {
    initStats();
    initFilters();
    buildYearlyChart();
    updateKeywordChart('all');
    buildHeatmap();
    handleSearchFilter(); // Show all initially
    
    // Set up scrollspy active states on nav
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        let current = '';
        
        sections.forEach(s => {
            const sectionTop = s.offsetTop;
            if (pageYOffset >= sectionTop - 120) {
                current = s.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

// 3. Render Statistics Header
function initStats() {
    document.getElementById('stat-total').textContent = window.ALL_DATA.length;
    document.getElementById('stat-masters').textContent = window.ALL_DATA.filter(t => t.degree_type === "修士").length;
    document.getElementById('stat-phds').textContent = window.ALL_DATA.filter(t => t.degree_type === "博士").length;

    // Key count
    const allKws = window.ALL_DATA.flatMap(t => t.keywords).filter(k => k && k !== "未登録");
    const uniqueKws = new Set(allKws);
    document.getElementById('stat-keywords').textContent = uniqueKws.size;
}

// 4. Filters & Facets Setup
function initFilters() {
    const yearSelect = document.getElementById('filter-year');
    const kwSelect = document.getElementById('filter-kw');

    // Reset options to defaults
    yearSelect.innerHTML = '<option value="">すべて</option>';
    kwSelect.innerHTML = '<option value="">すべて</option>';

    // Unique Years
    const years = [...new Set(window.ALL_DATA.map(t => t.year).filter(Boolean))].sort((a,b) => b - a);
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}年度`;
        yearSelect.appendChild(opt);
    });

    // Top keywords to list in filters
    const kwCounts = {};
    window.ALL_DATA.flatMap(t => t.keywords).forEach(k => {
        if (k && k !== "未登録") kwCounts[k] = (kwCounts[k] || 0) + 1;
    });
    const sortedKws = Object.entries(kwCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 30) // Take top 30 keywords
        .map(entry => entry[0]);

    sortedKws.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = `${k} (${kwCounts[k]}件)`;
        kwSelect.appendChild(opt);
    });
}

// 7. Live Searching & Faceted Filtering
function setViewMode(mode) {
    window.currentViewMode = mode;
    const cardBtn = document.getElementById('btn-card-view');
    const listBtn = document.getElementById('btn-list-view');
    const cardContainer = document.getElementById('thesis-list-container');
    const yearlyContainer = document.getElementById('thesis-yearly-container');

    if (mode === 'card') {
        cardBtn.classList.add('active');
        listBtn.classList.remove('active');
        cardContainer.style.display = '';
        yearlyContainer.style.display = 'none';
    } else {
        listBtn.classList.add('active');
        cardBtn.classList.remove('active');
        cardContainer.style.display = 'none';
        yearlyContainer.style.display = '';
    }
    handleSearchFilter();
}

function handleSearchFilter() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const degreeVal = document.getElementById('filter-degree').value;
    const yearVal = document.getElementById('filter-year').value;
    const kwVal = document.getElementById('filter-kw').value;

    const filtered = window.ALL_DATA.filter(t => {
        if (degreeVal && t.degree_type !== degreeVal) return false;
        if (yearVal && t.year !== parseInt(yearVal)) return false;
        if (kwVal && !t.keywords.includes(kwVal)) return false;
        if (query) {
            const text = [
                t.title, t.title_en, t.author,
                t.author_ruby, t.author_en, t.supervisor,
                t.keywords.join(" ")
            ].join(" ").toLowerCase();
            return text.includes(query);
        }
        return true;
    });

    document.getElementById('result-count').textContent = filtered.length;

    if (window.currentViewMode === 'list') {
        renderYearlyList(filtered, query);
    } else {
        renderThesisCards(filtered);
    }
}

// Render Cards
function renderThesisCards(theses) {
    const container = document.getElementById('thesis-list-container');
    container.innerHTML = "";

    if (theses.length === 0) {
        container.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--card-border);"></i>
                <p>条件に一致する学位論文が見つかりませんでした。</p>
            </div>
        `;
        return;
    }

    theses.forEach(t => {
        const card = document.createElement('div');
        card.className = "thesis-card";

        // Badges
        const metaTop = document.createElement('div');
        metaTop.className = "thesis-meta-top";
        
        const badgeClass = t.degree_type === "博士" ? "badge-phd" : "badge-master";
        const degreeLabel = t.degree_type === "博士" ? "博士論文" : "修士論文";

        metaTop.innerHTML = `
            <span class="thesis-year">${t.year ? t.year + '年度' : '年度不明'}</span>
            <span class="thesis-degree-badge ${badgeClass}">${degreeLabel}</span>
        `;
        card.appendChild(metaTop);

        // Title
        const title = document.createElement('h3');
        title.className = "thesis-title";
        title.textContent = t.title;
        card.appendChild(title);

        // English Title
        if (t.title_en && t.title_en !== t.title) {
            const titleEn = document.createElement('div');
            titleEn.className = "thesis-title-en";
            titleEn.textContent = t.title_en;
            card.appendChild(titleEn);
        }

        // Author Info
        const authorInfo = document.createElement('div');
        authorInfo.className = "thesis-author-info";
        authorInfo.innerHTML = `
            <span class="thesis-author">${t.author}</span>
            <span class="thesis-author-ruby">${t.author_ruby || ''}</span>
        `;
        card.appendChild(authorInfo);

        // Keywords
        const kwContainer = document.createElement('div');
        kwContainer.className = "thesis-keywords";
        t.keywords.forEach(k => {
            const badge = document.createElement('span');
            badge.className = "kw-badge";
            badge.textContent = k;
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('filter-kw').value = k;
                document.getElementById('filter-year').value = ""; // Reset year filter to "すべて"
                handleSearchFilter();
            });
            kwContainer.appendChild(badge);
        });
        card.appendChild(kwContainer);

        // Footer (Supervisor & Link)
        const footer = document.createElement('div');
        footer.className = "thesis-footer";
        footer.innerHTML = `
            <span class="thesis-sv">指導教員: ${t.supervisor}</span>
            <a href="${t.uri}" target="_blank" class="thesis-link">
                登録情報 <i class="fa-solid fa-up-right-from-square"></i>
            </a>
        `;
        card.appendChild(footer);

        container.appendChild(card);
    });
}

// Wareki Converter Helper
function getWarekiString(year, degreeType) {
    if (!year) return `年度不明　${degreeType}論文`;
    let wareki = "";
    if (year >= 2019) {
        const reiwaYear = year - 2018;
        wareki = reiwaYear === 1 ? "令和元" : `令和${reiwaYear}`;
    } else if (year >= 1989) {
        const heiseiYear = year - 1988;
        wareki = `平成${heiseiYear}`;
    } else {
        wareki = `昭和${year - 1925}`;
    }
    return `${wareki}年度修了　${degreeType}論文`;
}

// Render Yearly List View (Classic Gray Style)
function renderYearlyList(theses, query) {
    const container = document.getElementById('thesis-yearly-container');
    container.innerHTML = '';

    if (theses.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:var(--text-secondary);">
                <i class="fa-solid fa-folder-open" style="font-size:2.5rem; margin-bottom:1rem; color:var(--card-border);"></i>
                <p>条件に一致する学位論文が見つかりませんでした。</p>
            </div>`;
        return;
    }

    // Group by year (descending)
    const byYear = {};
    theses.forEach(t => {
        const y = t.year || 0;
        if (!byYear[y]) byYear[y] = { 博士: [], 修士: [] };
        const key = t.degree_type === '博士' ? '博士' : '修士';
        byYear[y][key].push(t);
    });

    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    years.forEach(y => {
        // Render PhD first, then Master
        ['博士', '修士'].forEach(deg => {
            const group = byYear[y][deg];
            if (!group || group.length === 0) return;

            const block = document.createElement('div');
            block.className = 'yearly-block-item';

            // Combined Heading (e.g., 平成29年度修了　修士論文)
            const heading = document.createElement('h3');
            heading.className = 'yearly-heading';
            heading.textContent = getWarekiString(y, deg);
            block.appendChild(heading);

            // Table with classic gray backgrounds
            const table = document.createElement('table');
            table.className = 'yearly-table-classic';

            group.forEach(t => {
                const tr = document.createElement('tr');

                // Author Cell (Darker Gray)
                const tdAuthor = document.createElement('td');
                tdAuthor.className = 'yearly-author-cell-classic';
                tdAuthor.textContent = t.author || '—';
                tr.appendChild(tdAuthor);

                // Title + link Cell (Lighter Gray)
                const tdTitle = document.createElement('td');
                tdTitle.className = 'yearly-title-cell-classic';

                let titleHtml = escapeHtml(t.title);
                if (query) {
                    const re = new RegExp(escapeRegex(query), 'gi');
                    titleHtml = titleHtml.replace(re, m => `<mark style="background:#fef08a;border-radius:2px;">${m}</mark>`);
                }
                tdTitle.innerHTML = titleHtml;

                if (t.uri) {
                    const linkSpan = document.createElement('span');
                    linkSpan.className = 'yearly-link-classic';
                    linkSpan.innerHTML = ` [<a href="${t.uri}" target="_blank">link</a>]`;
                    tdTitle.appendChild(linkSpan);
                }

                tr.appendChild(tdTitle);
                table.appendChild(tr);
            });

            block.appendChild(table);
            container.appendChild(block);
        });
    });
}

function escapeHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
