# users/views.py
from rest_framework import generics, permissions
# 1. Import thêm 'viewsets'
from rest_framework import generics, permissions, viewsets
# 2. Import thêm các model và serializer mới
from .models import Account, Transporter, Retailer
from .serializers import UserRegistrationSerializer, TransporterSerializer, RetailerSerializer

# (class UserRegistrationView của bạn đã CHÍNH XÁC, giữ nguyên)
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# ----------------------------------------------
# ---- 3. THÊM CÁC CLASS MỚI VÀO CUỐI TỆP ----
# ----------------------------------------------

class TransporterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint (CHỈ ĐỌC) để:
    - GET /api/v1/users/transporters/ (Get toàn bộ)
    - GET /api/v1/users/transporters/{id}/ (Get chính xác)
    """
    queryset = Transporter.objects.all()
    serializer_class = TransporterSerializer
    permission_classes = [permissions.IsAuthenticated] # Yêu cầu đăng nhập

class RetailerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint (CHỈ ĐỌC) để:
    - GET /api/v1/users/retailers/ (Get toàn bộ)
    - GET /api/v1/users/retailers/{id}/ (Get chính xác)
    """
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer
    permission_classes = [permissions.IsAuthenticated] # Yêu cầu đăng nhập