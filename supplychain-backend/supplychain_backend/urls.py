# supplychain_backend/urls.py
from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD
=======

# --- TẠO MỘT DANH SÁCH RIÊNG CHO CÁC API V1 ---
api_v1_patterns = [
    path('products/', include('products.urls')),
    path('users/', include('users.urls')),
    path('tracking/', include('tracking.urls')),
    # (Thêm các app khác của bạn như 'certificates', 'ipfs' vào đây)
    # path('certificates/', include('certificates.urls')),
    # path('ipfs/', include('ipfs.urls')),
]
>>>>>>> origin/mao_backend_workplaces

urlpatterns = [
    path('admin/', admin.site.urls),
    
<<<<<<< HEAD
    # === SỬA DÒNG NÀY ===
    # Thêm tiền tố 'products/' vào đây
    path('api/v1/products/', include('products.urls')), 
    
    # Tương tự cho các app khác
    path('api/v1/users/', include('users.urls')),
    path('api/v1/tracking/', include('tracking.urls')),
=======
    # --- ĐĂNG KÝ TẤT CẢ API V1 DƯỚI MỘT TIỀN TỐ DUY NHẤT ---
    path('api/v1/', include(api_v1_patterns)),
>>>>>>> origin/mao_backend_workplaces
]