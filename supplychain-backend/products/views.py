<<<<<<< HEAD
# products/views.py (Phiên bản V2 - Đã sửa lỗi)

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from web3.exceptions import ContractLogicError # 👈 Bắt lỗi Contract
import traceback # 👈 Để in lỗi chi tiết

=======
# products/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView       # <-- Import thêm
from rest_framework.response import Response
>>>>>>> origin/mao_backend_workplaces
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
<<<<<<< HEAD
    # Chỉ cho phép đọc, vì GHI phải qua API on-chain
    http_method_names = ['get', 'head', 'options'] 

# --- API ĐỌC TRỰC TIẾP TỪ BLOCKCHAIN (Cho QR Scan) ---
class ProductDetailOnChainView(APIView):
    permission_classes = [AllowAny] 
    
    def get(self, request, product_id):
        if not supply_chain_contract:
            return Response({"error": "Dịch vụ blockchain không sẵn sàng"}, status=503)

        try:
            # Dùng int() để đảm bảo
            product_data = supply_chain_contract.functions.getProduct(int(product_id)).call()
            stage_map = {0: "Created", 1: "Manufactured", 2: "Shipped", 3: "Delivered"}
            response_data = {
                "id": product_data[0],
                "name": product_data[1],
                "description": product_data[2],
                "owner_address": product_data[3],
                "stage_id": product_data[4],
                "stage_name": stage_map.get(product_data[4], "Unknown")
            }
            return Response(response_data)
        except Exception as e:
            return Response({"error": "Sản phẩm không tìm thấy trên blockchain.", "details": str(e)}, status=404)

# --- API GHI (WRITE) LÊN BLOCKCHAIN ---
class ProductBatchCreateView(APIView):
    permission_classes = [AllowAny] # Tạm thời cho phép test
    
    def post(self, request):
        if not all([w3, backend_account, supply_chain_contract]):
             return Response({"error": "Dịch vụ blockchain không sẵn sàng"}, status=503)

        products_data = request.data.get('products')
        if not products_data:
            return Response({"error": "Trường 'products' (array) là bắt buộc."}, status=400)
            
        try:
            names = [p['name'] for p in products_data]
            descriptions = [p['description'] for p in products_data]
        except KeyError as e:
            return Response({"error": f"Thiếu trường {e} trong một sản phẩm"}, status=400)

        try:
            # 3. Build transaction (Sửa lại)
            tx_data = {
                'from': backend_account.address,
                'nonce': w3.eth.get_transaction_count(backend_account.address),
                'chainId': w3.eth.chain_id, # 👈 FIX 1: THÊM CHAIN ID
                'gasPrice': w3.eth.gas_price
            }
            
            # 👈 FIX 2: TỰ ƯỚC TÍNH GAS
            estimated_gas = supply_chain_contract.functions.createProductBatch(
                _names=names,
                _descriptions=descriptions
            ).estimate_gas(tx_data)
            
            tx_data['gas'] = estimated_gas + 20000 # Thêm 20k gas dự phòng

            tx = supply_chain_contract.functions.createProductBatch(
                _names=names,
                _descriptions=descriptions
            ).build_transaction(tx_data)
            
            # 4. Ký và Gửi
            signed_tx = w3.eth.account.sign_transaction(tx, private_key=backend_account.key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # 5. === FIX 3: CHỜ BIÊN NHẬN (WAIT FOR RECEIPT) ===
            print(f"Đã gửi Tx: {tx_hash.hex()}. Đang chờ biên nhận...")
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60) 

            # 6. Kiểm tra trạng thái
            if tx_receipt.status == 0:
                raise ContractLogicError("Giao dịch thất bại (status=0). Kiểm tra logic contract (vd: require).")

            # Nếu status == 1 (Thành công)
            return Response({
                "message": f"Giao dịch THÀNH CÔNG. Đã tạo {len(names)} sản phẩm.",
                "tx_hash": tx_hash.hex(),
                "block_number": tx_receipt.blockNumber,
                "gas_used": tx_receipt.gasUsed
            }, status=201) # 201 Created

        except ContractLogicError as e:
            return Response({"error": f"Lỗi Contract: {e}"}, status=400)
        except Exception as e:
            traceback.print_exc() # In lỗi chi tiết ra console
            return Response({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
=======
    
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
>>>>>>> origin/mao_backend_workplaces
