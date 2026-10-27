# 魔方教室（Rubik's Cube Teacher）

用 Three.js 整嘅互動式 3×3 魔方教學工具（繁體中文／香港用語），連 **粵語旁白**（Fish Audio **Drama 3**）。

## 本機開啟（連 TTS）

```bash
cd rubiks-cube-teacher
cp .env.example .env   # 填入 FISH_AUDIO_API_KEY
export $(grep -v '^#' .env | xargs)   # 或者手動 export
npm start              # node server.mjs → http://127.0.0.1:8765/
```

純靜態（冇旁白 API）都可以：

```bash
python3 -m http.server 8765
```

ES modules + Three.js CDN，請用 HTTP 伺服器，唔好用 `file://`。

## 環境變數（Vercel／本機）

| 變數 | 必填 | 說明 |
|------|------|------|
| `FISH_AUDIO_API_KEY` | 旁白要用 | Fish Audio API key（**唔好**寫入前端） |
| `FISH_AUDIO_VOICE_ID` | 否 | `reference_id`；預設係公開粵語 voice |
| `PORT` | 否 | 本機 `server.mjs` 埠，預設 8765 |

Vercel：Project → Settings → Environment Variables 設定上面嘅 key，再 Deploy。前端只會打 `POST /api/tts`，key 留喺 serverless。

## 功能

- 立體魔方、OrbitControls、轉面動畫（轉面高亮）
- 打亂／還原／撤銷、螢幕掣、鍵盤快捷鍵
- 層先法七步教學 + 每步公式／示範
- **常用公式**分頁（Sexy / Sune / 黃十字等）+ 複製／示範／聽講解
- **快捷鍵**速查表
- **粵語旁白**：聽旁白、自動旁白、客戶端 blob cache + 伺服器 memory cache
- 教學／自由練習、動畫速度

## Deploy

由 GitHub 匯入 Vercel 即可。`api/tts.js` 係 serverless route；記得加 `FISH_AUDIO_API_KEY`。
