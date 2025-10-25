# supplychain_backend/urls.py
from django.contrib import admin
from django.urls import path, include  # <-- Nhớ import 'include'

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Thêm các API endpoint của bạn tại đây
    path('api/v1/', include('products.urls')),    # <--- THÊM DÒNG NÀY
    path('api/v1/', include('users.urls')),      # (Tương tự cho các app khác)
    path('api/v1/', include('tracking.urls')),   # (Tương tự cho các app khác)
]