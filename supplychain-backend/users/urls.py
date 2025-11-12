# users/urls.py
from django.urls import path
from .views import UserRegistrationView

# Import các view của thư viện simplejwt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Endpoint đăng ký (đã hoạt động)
    path('register/', UserRegistrationView.as_view(), name='register'),
    
    # Endpoint Đăng nhập MỚI
    # Khi POST 'username' và 'password' vào đây...
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # ...nó sẽ trả về một 'access' token và 'refresh' token.
    
    # Endpoint làm mới token (tùy chọn)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]