#!/bin/bash

# Dừng script ngay lập tức nếu có bất kỳ lệnh nào bị lỗi
set -e

echo "🔧 Running migrations..."
python manage.py migrate --noinput

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Gunicorn server..."
gunicorn supplychain_backend.wsgi:application \
    --workers 3 \
    --timeout 120 \
    --bind 0.0.0.0:$PORT