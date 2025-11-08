# products/views.py
from rest_framework import viewsets, permissions
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép xem (GET) và tạo (POST) Products.
    """
    queryset = Product.objects.all().order_by('product_id')
    serializer_class = ProductSerializer
    
    # --- THÊM BẢO VỆ ---
    # Yêu cầu user phải đăng nhập
    permission_classes = [permissions.IsAuthenticated]

    # --- LOGIC QUAN TRỌNG ---
    # Gửi thông tin 'request' (chứa user) vào context của Serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context