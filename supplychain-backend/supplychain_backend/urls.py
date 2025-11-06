# supplychain_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # === SỬA DÒNG NÀY ===
    # Thêm tiền tố 'products/' vào đây
    path('api/v1/products/', include('products.urls')), 
    
    # Tương tự cho các app khác
    path('api/v1/users/', include('users.urls')),
    path('api/v1/tracking/', include('tracking.urls')),
]