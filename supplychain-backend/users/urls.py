# users/urls.py
from django.urls import path, include # <-- 1. Import 'include'
# 2. Import các ViewSet mới
from .views import UserRegistrationView, TransporterViewSet, RetailerViewSet
from rest_framework.routers import DefaultRouter # <-- 3. Import Router
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# 4. Tạo router
router = DefaultRouter()
router.register(r'transporters', TransporterViewSet, basename='transporter')
router.register(r'retailers', RetailerViewSet, basename='retailer')

urlpatterns = [
    # 5. Thêm các URL của router
    # (Nó sẽ tạo: /api/v1/users/transporters/ và .../retailers/)
    path('', include(router.urls)),
    
    # 6. Giữ các URL đăng ký/đăng nhập cũ của bạn
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]