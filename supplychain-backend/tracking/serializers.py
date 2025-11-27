# tracking/serializers.py
from rest_framework import serializers, exceptions
from .models import Event, TrackingEvent
# (Import Product và Account để lấy tên)
from products.models import Product
from users.models import Account

# --- EventSerializer (Đã sửa lỗi TypeError) ---
class EventSerializer(serializers.ModelSerializer):
    transporter_name = serializers.CharField(
        source='trackingevent.transporter.transporter.name', 
        read_only=True, 
        allow_null=True
    )
    
    # Logic: Event -> (transaction_id) -> TrackingEvent -> Retailer -> Account -> Name
    retailer_name = serializers.CharField(
        source='trackingevent.retailer.retailer.name', 
        read_only=True,
        allow_null=True
    )

    # Logic: Event -> (transaction_id) -> TrackingEvent -> Retailer -> Location
    retailer_location = serializers.CharField(
        source='trackingevent.retailer.location', 
        read_only=True, 
        allow_null=True
    )

    class Meta:
        model = Event
        fields = [
            'transaction_id', 
            'product_id', # (Khớp với tên trường trong model 'Event')
            'order_status', 
            'assign_date', 
            'received_date',
            'transporter_name',
            'retailer_name',
            'retailer_location'
        ]
        read_only_fields = ('transaction_id',)
        
        # Logic phân quyền (từ Model 58)
        extra_kwargs = {
            'product_id': {'write_only': True},
            'order_status': {'read_only': True},
            'assign_date': {'read_only': True},
            'received_date': {'read_only': True},
        }

    def create(self, validated_data):
        # (Logic tạo 'Event' của Retailer)
        # Yêu cầu của bạn: mặc định 'pending' và 'null'
        # CSDL đã tự động làm điều này, nên chúng ta không cần code
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # (Logic phân quyền UPDATE của Transporter/Retailer/Manager)
        user = self.context['request'].user
        data = self.initial_data # Đọc từ JSON thô

        if user.role == 'manager':
            instance.order_status = data.get('order_status', instance.order_status)
            instance.assign_date = data.get('assign_date', instance.assign_date)
            instance.received_date = data.get('received_date', instance.received_date)
        
        elif user.role == 'transporter':
            # Transporter CHỈ được sửa 2 trường này
            if 'order_status' in data:
                instance.order_status = data.get('order_status')
            if 'assign_date' in data:
                instance.assign_date = data.get('assign_date')
            
            if 'received_date' in data:
                raise exceptions.PermissionDenied("Transporter không có quyền cập nhật received_date.")

        elif user.role == 'retailer':
            # Retailer CHỈ được sửa 1 trường này
            if 'received_date' in data:
                instance.received_date = data.get('received_date')
            
            if 'order_status' in data or 'assign_date' in data:
                raise exceptions.PermissionDenied("Retailer không có quyền cập nhật order_status hoặc assign_date.")

        else:
            raise exceptions.PermissionDenied("Bạn không có quyền cập nhật Event.")

        instance.save()
        return instance

# --- TrackingEventSerializer (Đã cập nhật theo yêu cầu) ---
class TrackingEventSerializer(serializers.ModelSerializer):
    
    # === Lấy các trường từ Bảng 6 (TrackingEvent) ===
    transporter_name = serializers.CharField(source='transporter.transporter.name', read_only=True, allow_null=True)
    retailer_name = serializers.CharField(source='retailer.retailer.name', read_only=True, allow_null=True)

    # === Lấy các trường từ Bảng 5 (Event) (thông qua 'transaction') ===
    transaction_id = serializers.IntegerField(source='transaction.transaction_id', read_only=True)
    product_id = serializers.CharField(source='transaction.product_id.product_id', read_only=True) # (product_id_id -> product_id)
    product_name = serializers.CharField(source='transaction.product_id.name', read_only=True)
    order_status = serializers.CharField(source='transaction.order_status', read_only=True)
    assign_date = serializers.DateField(source='transaction.assign_date', read_only=True)
    received_date = serializers.DateField(source='transaction.received_date', read_only=True)
    
    class Meta:
        model = TrackingEvent
        # Liệt kê tất cả các trường BẠN YÊU CẦU (chỉ đọc)
        fields = [
            'transaction_id',
            'product_id',
            'product_name',
            'order_status',
            'assign_date',
            'received_date',
            'transporter_name',
            'retailer_name',
            
            # Các trường 'ID' (dùng để GHI/POST)
            'transaction', # (PK/FK đến Event)
            'transporter', # (FK đến Transporter Profile)
            'retailer',    # (FK đến Retailer Profile)
        ]
        
        # Ẩn các trường 'ID' thô khi GHI
        extra_kwargs = {
            'transaction': {'write_only': True},
            'transporter': {'write_only': True, 'allow_null': True},
            'retailer': {'write_only': True, 'allow_null': True},
        }