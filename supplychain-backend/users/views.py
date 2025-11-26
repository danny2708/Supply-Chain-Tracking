# users/views.py
from rest_framework import generics, permissions
# 1. Import thêm 'viewsets'
from rest_framework import generics, permissions, viewsets, status
# 2. Import thêm các model và serializer mới
from .models import Account, Transporter, Retailer
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, TransporterSerializer, RetailerSerializer, AccountSerializer

# (class UserRegistrationView của bạn đã CHÍNH XÁC, giữ nguyên)
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class AccountViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API để lấy thông tin user (bao gồm role) theo ID.
    Chỉ cho phép xem (ReadOnly), không cho sửa xóa lung tung ở đây.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

# ----------------------------------------------
# ---- 3. THÊM CÁC CLASS MỚI VÀO CUỐI TỆP ----
# ----------------------------------------------

class TransporterViewSet(viewsets.ModelViewSet):
    """
    API endpoint (CHỈ ĐỌC) để:
    - GET /api/v1/users/transporters/ (Get toàn bộ)
    - GET /api/v1/users/transporters/{id}/ (Get chính xác)
    """
    queryset = Transporter.objects.all()
    serializer_class = TransporterSerializer
    permission_classes = [permissions.IsAuthenticated] # Yêu cầu đăng nhập

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Kiểm tra an toàn xem có user liên kết không
            if not hasattr(instance, 'user') or not instance.user:
                # Nếu không có user (dữ liệu rác), cho phép xóa cứng luôn record Transporter này
                instance.delete()
                return Response({"message": "Đã xóa Transporter rác (không có tài khoản user)."}, status=status.HTTP_200_OK)

            user = instance.user
            
            # Logic Deactivate / Activate
            if user.is_active:
                user.is_active = False
                user.save()
                return Response(
                    {"message": f"Đã vô hiệu hóa (Deactivate) Transporter {instance.name}."}, 
                    status=status.HTTP_200_OK
                )
            else:
                user.is_active = True
                user.save()
                return Response(
                    {"message": f"Đã kích hoạt lại (Activate) Transporter {instance.name}."}, 
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            # Bắt mọi lỗi và trả về 400 thay vì 500 để dễ debug
            print(f"Lỗi khi xóa Transporter: {str(e)}") # In ra terminal backend
            return Response(
                {"error": f"Lỗi hệ thống: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class RetailerViewSet(viewsets.ModelViewSet):
    """
    API endpoint (CHỈ ĐỌC) để:
    - GET /api/v1/users/retailers/ (Get toàn bộ)
    - GET /api/v1/users/retailers/{id}/ (Get chính xác)
    """
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer
    permission_classes = [permissions.IsAuthenticated] # Yêu cầu đăng nhập

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            if not hasattr(instance, 'user') or not instance.user:
                instance.delete()
                return Response({"message": "Đã xóa Retailer rác."}, status=status.HTTP_200_OK)

            user = instance.user
            
            if user.is_active:
                user.is_active = False
                user.save()
                return Response(
                    {"message": f"Đã vô hiệu hóa Retailer {instance.name}."}, 
                    status=status.HTTP_200_OK
                )
            else:
                user.is_active = True
                user.save()
                return Response(
                    {"message": f"Đã kích hoạt lại Retailer {instance.name}."}, 
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            print(f"Lỗi khi xóa Retailer: {str(e)}")
            return Response(
                {"error": f"Lỗi hệ thống: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )