# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet # Import bộ não

# Router tự động tạo các URL cho ViewSet (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Dòng này tạo ra URL 'products/'
    path('', include(router.urls)),
]