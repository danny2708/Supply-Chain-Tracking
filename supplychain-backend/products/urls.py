from django.urls import path, include
from rest_framework.routers import DefaultRouter
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
]