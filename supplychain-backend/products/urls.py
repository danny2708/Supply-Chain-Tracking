# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()

# ---- SỬA LỖI Ở ĐÂY ----
# Thay vì 'products', hãy dùng '' (chuỗi rỗng)
# vì 'products/' đã được định nghĩa ở tệp urls.py chính.
router.register(r'', ProductViewSet, basename='product')
# (Trước đây là: router.register(r'products', ...))

urlpatterns = [
    path('', include(router.urls)),
]