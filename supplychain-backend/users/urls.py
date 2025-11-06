# users/urls.py (TỆP MỚI)
from django.urls import path
from . import views

urlpatterns = [
    # Tạo một địa chỉ cụ thể cho việc đăng ký
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    
    # (Sau này bạn sẽ thêm 'auth/login/' vào đây)
]