// js/normalize.js - Shared Keyword Normalization Map and Functions

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
