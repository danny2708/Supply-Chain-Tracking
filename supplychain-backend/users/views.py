# users/views.py
from rest_framework import generics, permissions
from .serializers import UserRegistrationSerializer

# CreateAPIView chỉ cho phép phương thức POST
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    # Bất kỳ ai cũng có thể gọi API này (để đăng ký)
    permission_classes = [permissions.AllowAny]