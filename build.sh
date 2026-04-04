#!/bin/bash
# 友誼大富翁 — 重新打包成單一 HTML 的步驟

set -e
echo "📦 安裝相依套件..."
npx pnpm install

echo "🔨 使用 Parcel 打包..."
npx pnpm exec parcel build index.html --dist-dir dist --no-source-maps

echo "🎯 內嵌成單一 HTML..."
# Remove Google Fonts link before inlining (html-inline can't fetch external URLs)
sed 's|<link.*fonts.googleapis.com.*>||g' dist/index.html > dist/index_nofont.html
npx pnpm exec html-inline dist/index_nofont.html > index_bundle.html

echo "✅ 完成！輸出：index_bundle.html"
echo "   （需要搭配同目錄的 cards.json 才能使用擴充題庫）"
