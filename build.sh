#!/bin/bash
# 友誼大富翁 — 重新打包成單一 HTML 的步驟
# 需求：Node.js 18+、npm

set -e

if ! command -v node >/dev/null 2>&1; then
  echo "❌ 找不到 Node.js。請先安裝 Node.js 18+。"
  echo "   建議：brew install node"
  echo "   或安裝後重新開啟終端機再執行 ./build.sh"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ 找不到 npm。請確認 Node.js 安裝完整（含 npm）。"
  exit 1
fi

echo "🧰 使用套件管理器：npm"

echo "📦 安裝相依套件..."
npm install

echo "🔨 使用 Vite 打包（IIFE 格式）..."
npm run build

echo "🎯 複製單一 HTML 到根目錄..."
cp ./dist/index.html ./index.single.html

node -e "
const fs = require('fs');
const size = fs.statSync('./index.single.html').size;
console.log('index.single.html written, size:', Math.round(size/1024) + 'KB');
"

echo "✅ 完成！輸出：index.single.html"
echo "   （搭配同目錄的 cards.json 可使用擴充題庫，需透過 http:// 伺服器開啟）"
echo "   （直接用瀏覽器開啟 file:// 也可運作，但只使用內建預設題庫）"
