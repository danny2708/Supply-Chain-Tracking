# products/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView       # <-- Import thêm
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

# Import service kết nối blockchain
try:
    from app.services.blockchain_service import w3, backend_account, supply_chain_contract
except ImportError:
    supply_chain_contract = None
    w3 = None
    backend_account = None

# --- API ĐỌC TỪ DATABASE (Đã đồng bộ) ---
class ProductViewSet(viewsets.ModelViewSet):
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
    
class RetryProductOnChainView(APIView):
    """
    API endpoint tùy chỉnh để 'gửi lại' (retry) một sản phẩm
    đã bị 'failed' on-chain.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id, format=None):
        # 1. Kiểm tra quyền
        if request.user.role != 'producer':
            return Response(
                {"error": "Chỉ producer mới có quyền retry."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # 2. Tìm sản phẩm
            product = Product.objects.get(product_id=product_id)
            
            # 3. (Bảo mật) Kiểm tra xem có phải user sở hữu không
            if product.user != request.user:
                return Response(
                    {"error": "Bạn không sở hữu sản phẩm này."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # 4. Chỉ retry nếu nó thực sự 'failed'
            if product.on_chain_status == 'failed':
                
                # 5. ĐẶT LẠI TRẠNG THÁI (Đây là logic UPDATE)
                product.on_chain_status = 'pending'
                product.save()
                
                print(f"\n--- [RUNSERVER]: Đã nhận yêu cầu RETRY cho {product.product_id} ---")
                
                return Response(
                    {"detail": f"Đã gửi lại {product_id} vào hàng đợi on-chain."},
                    status=status.HTTP_202_ACCEPTED # 202: Đã chấp nhận (chờ xử lý)
                )
            else:
                # Nếu nó là 'pending' hoặc 'completed'
                return Response(
                    {"error": f"Sản phẩm đang ở trạng thái '{product.on_chain_status}', không thể retry."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Product.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy sản phẩm này."}, 
                status=status.HTTP_404_NOT_FOUND
            )
