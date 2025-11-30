# products/views.py
import requests
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action       # <-- 1. IMPORT 'action'
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.http import HttpResponse
from . import services as product_services
# 1. Import các class quyền mới
from core.permissions import IsManager, IsProducer, IsOwner

# 2. IMPORT CÁC MODEL VÀ SERIALIZER TỪ 'tracking' ĐỂ SỬ DỤNG
try:
    from tracking.models import Event, TrackingEvent
    from tracking.serializers import TrackingEventSerializer
except ImportError:
    pass # Xử lý nếu app 'tracking' không tồn tại

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
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    lookup_field = 'product_id'

    def perform_create(self, serializer):
        # Gán user hiện tại vào sản phẩm khi tạo mới
        serializer.save(user=self.request.user)
    # ---- 1. TRUYỀN 'request' VÀO SERIALIZER CONTEXT ----
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    # ---- 2. LOGIC PHÂN QUYỀN MỚI ----
    def get_permissions(self):
        """
        Gán quyền dựa trên hành động (action).
        """
        if self.action in ['retrieve', 'history']:
            self.permission_classes = [permissions.AllowAny]


        elif self.action == 'create':
            # Chỉ Producer được TẠO
            self.permission_classes = [IsProducer]
        
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Manager được sửa/xóa TẤT CẢ
            # Producer CHỈ được sửa/xóa CỦA MÌNH
            self.permission_classes = [ IsManager | (IsProducer & IsOwner) ]
        
        else:
            # list (GET)
            # Mọi người (đã đăng nhập) đều được XEM
            self.permission_classes = [permissions.IsAuthenticated]
        
        return super().get_permissions()
    # ---- 3. LOGIC LỌC (FILTER) MỚI ----
    def get_queryset(self):
        """
        Manager có thể lọc theo producer_id.
        Các vai trò khác xem tất cả (theo yêu cầu của bạn).
        """
        user = self.request.user
        queryset = Product.objects.all()

        # Xử lý yêu cầu: ?producer_id=...
        producer_id_query = self.request.query_params.get('producer_id', None)
        
        if producer_id_query is not None:
            # Chỉ Manager mới được dùng bộ lọc này
            if user.role == 'manager':
                return queryset.filter(user_id=producer_id_query).order_by('product_id')
            else:
                # Các vai trò khác nếu cố lọc sẽ thấy danh sách rỗng
                return queryset.none()
        
        # Mọi vai trò (bao gồm Producer) đều thấy tất cả nếu không lọc
        return queryset.order_by('product_id')

    # ---- 4. API TRUY VẤN LỊCH SỬ SẢN PHẨM (Yêu cầu của bạn) ----
    # API này sẽ tạo ra URL: GET /api/v1/products/{product_id}/history/
    @action(detail=True, methods=['get'])
    def history(self, request, product_id=None):
        """
        Trả về tất cả các tracking event (lịch sử)
        liên quan đến một sản phẩm cụ thể.
        """
        try:
            product = self.get_object() # (pk chính là product_id)
            
            # 1. Tìm tất cả 'Events' (giao dịch) cho sản phẩm này
            events = Event.objects.filter(product_id=product.product_id)
            
            # 2. Tìm tất cả 'TrackingEvents' (ai đã tham gia)
            tracking_events = TrackingEvent.objects.filter(transaction__in=events)
            
            # 3. Trả về dữ liệu
            # (Chúng ta dùng 'TrackingEventSerializer' để hiển thị tên)
            serializer = TrackingEventSerializer(tracking_events, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 
        
    @action(detail=False, methods=["post"], url_path="import_excel", url_name="import-excel")
    def import_excel(self, request):
        """
        POST /api/v1/products/import_excel/
        - multipart/form-data with key 'file' containing .xlsx
        - user must be authenticated, product will be created with request.user
        """
        # permission: must be authenticated; creation limited to Producer in get_permissions (optional)
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "Thiếu file. Gửi file excel (.xlsx) bằng key 'file'."},
                            status=status.HTTP_400_BAD_REQUEST)

        # optional: check role (chỉ producer mới import được)
        if request.user.role != "producer":
            return Response({"error": "Chỉ producer mới được import sản phẩm."},
                            status=status.HTTP_403_FORBIDDEN)

        created, errors = product_services.parse_excel_and_create_products(uploaded_file, request, ProductSerializer)
        return Response({"created_count": len(created), "created": created, "errors": errors},
                        status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=["get"], url_path="export_excel", url_name="export-excel")
    def export_excel(self, request):
        """
        GET /api/v1/products/export_excel/
        """
        # 1. Chuẩn bị URL
        # Lưu ý: Nếu đang chạy local docker/k8s, 'build_absolute_uri' có thể trả về http://localhost
        # mà container không gọi được chính nó qua localhost. Nếu lỗi connection, hãy dùng service name hoặc 127.0.0.1
        api_url = request.build_absolute_uri("/api/v1/products/") 
        
        auth = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        params = request.query_params.dict() if request.query_params else None

        try:
            # 2. Gọi API nội bộ lấy data
            data = product_services.fetch_products_from_api(api_url, auth, params=params)
            
            # 3. Chuẩn hóa data list
            products_list = []
            if isinstance(data, dict) and "results" in data:
                products_list = data["results"]
            elif isinstance(data, list):
                products_list = data
            else:
                products_list = data.get("results") if isinstance(data, dict) else []

            # 4. Tạo file Excel (Đã fix lỗi TypeError trong services)
            excel_bytes = product_services.build_excel_from_products_list(products_list)
            
            # 5. Trả về file
            filename = "products_export.xlsx"
            response = HttpResponse(
                excel_bytes, 
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response

        except requests.HTTPError as e:
            # Lỗi từ API products (ví dụ 401, 403, 404 từ upstream)
            error_msg = f"Upstream API Error: {str(e)}"
            try:
                # Cố gắng lấy message chi tiết từ response lỗi của upstream
                detail = e.response.json()
            except:
                detail = str(e)
            
            return Response(
                {"error": "Không thể lấy dữ liệu sản phẩm", "detail": detail}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
            
        except Exception as e:
            # Lỗi code logic (ví dụ lỗi Excel, lỗi parse data)
            import traceback
            traceback.print_exc() # In lỗi ra console server để debug
            return Response(
                {"error": "Lỗi khi tạo file Excel", "detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
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
        