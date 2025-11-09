from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import ProductViewSet, ProductDetailOnChainView, ProductBatchCreateView 

# Router này sẽ chỉ tạo ra '/' và '/<pk>/'
router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product') 

urlpatterns = [
    # 1. API TẠO LÔ SẢN PHẨM (Ưu tiên cao nhất)
    path(
        'create-batch/', 
        ProductBatchCreateView.as_view(), 
        name='product-create-batch'
    ),

    # 2. Route cho Quét QR (Ưu tiên cao)
    path(
        'scan/<int:product_id>/', 
        ProductDetailOnChainView.as_view(), 
        name='product-detail-onchain'
    ),
    
    # 3. Route cho ProductViewSet (Ưu tiên thấp nhất - để tránh xung đột)
    # Đây là đường dẫn chung cuối cùng được kiểm tra
    path('', include(router.urls)), 
=======
from .views import ProductViewSet, RetryProductOnChainView # <-- 1. Import view mới
router = DefaultRouter()

# ---- SỬA LỖI Ở ĐÂY ----
# Thay vì 'products', hãy dùng '' (chuỗi rỗng)
# vì 'products/' đã được định nghĩa ở tệp urls.py chính.
router.register(r'', ProductViewSet, basename='product')
# (Trước đây là: router.register(r'products', ...))

urlpatterns = [
    path('', include(router.urls)),
    path('<str:product_id>/retry/', RetryProductOnChainView.as_view(), name='product-retry'),
>>>>>>> origin/mao_backend_workplaces
]