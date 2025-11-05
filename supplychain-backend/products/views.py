# products/views.py

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny # Cho phép ai cũng có thể quét QR

from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated

# Import service kết nối blockchain bạn đã tạo (ở bước 1)
try:
    from app.services.blockchain_service import w3, backend_account, supply_chain_contract
except ImportError:
    supply_chain_contract = None
    w3 = None
    backend_account = None

# ---
# API ĐỌC TỪ DATABASE (Do listener đồng bộ về)
# ---
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép xem (GET) và tạo (POST) Products.
    ViewSet này làm việc với database PostgreSQL của bạn,
    vốn được đồng bộ hóa bởi 'listen_events'.
    """
    queryset = Product.objects.all().order_by('product_id')
    serializer_class = ProductSerializer
    # Bạn có thể thêm permission classes ở đây, ví dụ: IsAdminUser
    

# ---
# API ĐỌC TRỰC TIẾP TỪ BLOCKCHAIN (Cho QR Scan)
# ---
class ProductDetailOnChainView(APIView):
    """
    API endpoint CHUYÊN DỤNG cho việc quét QR code.
    Nó đọc dữ liệu trực tiếp từ Smart Contract (on-chain)
    để đảm bảo tính minh bạch cao nhất.
    """
    # permission_classes = [AllowAny] # Mở cho bất kỳ ai quét mã QR
    
    def get(self, request, product_id):
        """
        Trả về thông tin chi tiết của một sản phẩm từ blockchain.
        """
        if not supply_chain_contract:
            return Response({"error": "Dịch vụ blockchain không sẵn sàng"}, status=503)

        try:
            # 1. Gọi hàm .call() (miễn phí, không phải transaction)
            #    Hàm getProduct(id) trong contract của bạn
            product_data = supply_chain_contract.functions.getProduct(product_id).call()

            # 2. Map data từ tuple (contract trả về) sang JSON
            #    Thứ tự trả về: (id, name, description, owner, stage_enum)
            stage_map = {
                0: "Created", 
                1: "Manufactured", 
                2: "Shipped", 
                3: "Delivered"
            }

            response_data = {
                "id": product_data[0],
                "name": product_data[1],
                "description": product_data[2],
                "owner_address": product_data[3], # Địa chỉ ví của chủ sở hữu
                "stage_id": product_data[4],      # Số (0, 1, 2, 3)
                "stage_name": stage_map.get(product_data[4], "Unknown") # Tên
            }
            
            # 3. (Tùy chọn) Lấy lịch sử (tracking_event) từ DB
            #    và đính kèm vào đây để có response đầy đủ nhất.
            #    Ví dụ:
            #    history = TrackingEvent.objects.filter(product_id=product_id)
            #    history_serializer = TrackingEventSerializer(history, many=True)
            #    response_data["history"] = history_serializer.data

            return Response(response_data)

        except Exception as e:
            # Lỗi này thường xảy ra nếu product_id không tồn tại trên contract
            return Response({"error": "Sản phẩm không tìm thấy trên blockchain.", "details": str(e)}, status=404)


class ProductBatchCreateView(APIView):
    # permission_classes = [IsAuthenticated] # Yêu cầu user phải login
    permission_classes = [AllowAny]
    def post(self, request):
        # 1. Xác thực vai trò (bạn cần tự implement logic này)
        # if not request.user.role == 'producer':
        #    return Response({"error": "Không có quyền"}, status=403)

        # 2. Lấy data (giả sử dạng [{name: "A"}, {name: "B"}])
        products_data = request.data.get('products')
        names = [p['name'] for p in products_data]
        descriptions = [p['description'] for p in products_data]

        try:
            # 3. Build transaction gọi hàm batch
            tx = supply_chain_contract.functions.createProductBatch(
                _names=names,
                _descriptions=descriptions
            ).build_transaction({
                'from': backend_account.address,
                'nonce': w3.eth.get_transaction_count(backend_account.address),
                'gas': 2000000, # Cần ước lượng gas cẩn thận
                'gasPrice': w3.eth.gas_price
            })
            
            # 4. Ký và Gửi
            signed_tx = w3.eth.account.sign_transaction(tx, private_key=backend_account.key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # 5. Trả về ngay lập tức (không cần chờ receipt)
            return Response({
                "message": f"Đã gửi yêu cầu tạo {len(names)} sản phẩm.",
                "tx_hash": tx_hash.hex()
            }, status=202) # 202 Accepted

        except Exception as e:
            return Response({"error": str(e)}, status=500)