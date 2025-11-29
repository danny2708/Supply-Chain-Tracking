#!/bin/bash
set -e

echo "🔧 Running migrations with --fake-initial..."
# Lệnh này sẽ áp dụng các migration chưa có, và giả lập các migration
# mà Django thấy bảng của nó đã tồn tại trong DB (như bảng account).
python manage.py migrate --fake-initial

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Gunicorn server..."
gunicorn supplychain_backend.wsgi:application --workers 3 --timeout 120 --bind 0.0.0.0:$PORT