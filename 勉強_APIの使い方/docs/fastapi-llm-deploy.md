# FastAPIをGemini API代理として使う手順

## 方針

この構成では、業務ロジックはすべてブラウザ側に置きます。

ブラウザ側の役割:

- 質問フォームを表示する
- 回答を集める
- 診断用promptを作る
- LLM結果を画面に表示する
- 失敗時はローカル診断に戻す

自分のサーバー側の役割:

- `GOOGLE_LLM_API_KEY` を環境変数で持つ
- ブラウザから受け取ったpromptをGeminiへ転送する
- Geminiの返答テキストをブラウザへ返す

つまりサーバーは診断アプリの中身を知りません。API keyを隠すための薄い代理です。

## 全体構成

```text
JAISTサーバー:
  shinndann.html
  src/shinndann.css
  src/shinndann.js

自分のサーバー:
  FastAPI
  /api/gemini
  GOOGLE_LLM_API_KEY
```

## 1. 自分のサーバーへファイルを置く

```bash
scp -r fastapi_llm_server user@your-server:/home/user/
```

## 2. Python環境を作る

自分のサーバーで実行します。

```bash
cd /home/user/fastapi_llm_server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. .envを作る

```bash
cp .env.example .env
vi .env
```

例:

```env
GOOGLE_LLM_API_KEY=your_real_gemini_api_key
GOOGLE_LLM_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=https://your-jaist-page.example.ac.jp
```

テスト中だけなら `ALLOWED_ORIGINS=*` でも動きます。公開時はJAISTページのURLに限定してください。

## 4. 起動テスト

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

確認:

```bash
curl http://127.0.0.1:8000/health
```

期待する返答:

```json
{"status":"ok"}
```

## 5. Gemini代理APIのテスト

```bash
curl -X POST http://127.0.0.1:8000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "日本語で短い挨拶を1つ作ってください。",
    "generationConfig": {
      "temperature": 0.8,
      "maxOutputTokens": 80
    }
  }'
```

期待する返答:

```json
{
  "text": "..."
}
```

## 6. 外部からアクセスできるようにする

8000番を直接公開する場合:

```bash
sudo ufw allow 8000/tcp
```

クラウドサーバーの場合は管理画面のSecurity Groupでも8000番を開けます。

外部から確認:

```bash
curl http://your-server-domain-or-ip:8000/health
```

## 7. JAIST側のHTMLから呼ぶ

`shinndann.html` の `src/shinndann.js` より前にAPI URLを設定します。

```html
<script>
  window.LLM_API_ENDPOINT = "http://your-server-domain-or-ip:8000/api/gemini";
</script>
<script src="./src/shinndann.js"></script>
```

`src/shinndann.js` はこの値を使います。

```js
const LLM_API_ENDPOINT = window.LLM_API_ENDPOINT || "/api/gemini";
```

## 8. HTTPSについて

JAISTページが `https://...` の場合、`http://...` のAPIはブラウザにブロックされることがあります。

その場合は自分のAPIもHTTPS化してください。

```html
<script>
  window.LLM_API_ENDPOINT = "https://your-api-domain.com/api/gemini";
</script>
<script src="./src/shinndann.js"></script>
```

HTTPS化は Nginx + Let's Encrypt が扱いやすいです。

## 9. systemdで常駐させる例

`/etc/systemd/system/gemini-proxy.service`

```ini
[Unit]
Description=Gemini Proxy FastAPI Server
After=network.target

[Service]
User=user
WorkingDirectory=/home/user/fastapi_llm_server
EnvironmentFile=/home/user/fastapi_llm_server/.env
ExecStart=/home/user/fastapi_llm_server/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

起動:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gemini-proxy
sudo systemctl start gemini-proxy
sudo systemctl status gemini-proxy
```

Nginxなしで8000番を直接公開するなら、`--host 0.0.0.0` にします。公開運用ではNginx + HTTPSがおすすめです。

## 10. 失敗時の確認

画面が「ローカル診断」になる場合、Gemini代理APIへのリクエストに失敗しています。

確認ポイント:

- `window.LLM_API_ENDPOINT` が `/api/gemini` になっているか
- FastAPIの `/health` が外部から見えるか
- `.env` に `GOOGLE_LLM_API_KEY` が入っているか
- CORSの `ALLOWED_ORIGINS` がJAISTページを許可しているか
- HTTPSページからHTTP APIを呼んでいないか
- ブラウザConsoleにCORSやNetworkエラーが出ていないか
