#!/bin/bash
# ZR FACTORY ERP - AUTO LAUNCHER
echo "🚀 تشغيل نظام ZR FACTORY ERP..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 تثبيت الحزم لأول مرة..."
  npm install
fi

echo "🌐 جاري فتح لوحة التحكم في المتصفح..."
npm run dev
