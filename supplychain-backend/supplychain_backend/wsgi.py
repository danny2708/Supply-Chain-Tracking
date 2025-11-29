import os
import sys

from django.core.wsgi import get_wsgi_application

# Thêm thư mục chứa manage.py vào Python path
# Điều này là cần thiết nếu bạn dùng cấu trúc monorepo hoặc file start.sh được chạy từ root
# Giả sử thư mục chứa manage.py là thư mục cha của thư mục này (supplychain_backend)
# Thư mục cha của thư mục chứa wsgi.py là nơi chứa settings.py
# Thư mục cha của thư mục chứa settings.py là nơi chứa manage.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))


# Định nghĩa biến môi trường cho Django settings
# 'supplychain_backend.settings' phải khớp với tên thư mục cấu hình và tên file settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supplychain_backend.settings')

# Khởi tạo WSGI application
# Gunicorn bắt buộc phải tìm thấy biến tên là 'application'
application = get_wsgi_application()