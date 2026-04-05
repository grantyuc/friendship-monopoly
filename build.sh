#!/bin/bash
# 友誼大富翁 — 重新打包成單一 HTML 的步驟
# 需求：Node.js 18+、npm

set -e

echo "📦 安裝相依套件..."
npm install

echo "🔨 使用 Vite 打包（IIFE 格式）..."
npm run build

echo "🎯 內嵌成單一 HTML..."
node -e "
const fs = require('fs');
const js = fs.readFileSync('./dist/assets/index.js', 'utf8');
const html = \`<!doctype html>
<html lang=\"zh-TW\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>友誼大富翁</title>
  </head>
  <body>
    <div id=\"root\"></div>
    <script>\${js}</script>
  </body>
</html>\`;
fs.writeFileSync('./index.html', html, 'utf8');
const size = fs.statSync('./index.html').size;
console.log('index.html written, size:', Math.round(size/1024) + 'KB');
"

echo "✅ 完成！輸出：index.html"
echo "   （搭配同目錄的 cards.json 可使用擴充題庫，需透過 http:// 伺服器開啟）"
echo "   （直接用瀏覽器開啟 file:// 也可運作，但只使用內建預設題庫）"
