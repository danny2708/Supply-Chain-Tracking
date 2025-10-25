# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductDetailOnChainView # Import bộ não

# Router tự động tạo các URL cho ViewSet (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Dòng này tạo ra URL 'products/'
    path('', include(router.urls)),

    path(
        'products/scan/<int:product_id>/', 
        ProductDetailOnChainView.as_view(), 
        name='product-detail-onchain'
    ),
]