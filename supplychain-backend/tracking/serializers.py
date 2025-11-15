# tracking/serializers.py
from rest_framework import serializers, exceptions
from .models import Event, TrackingEvent
# (Chúng ta không cần import Product ở đây cho EventSerializer nữa)

class EventSerializer(serializers.ModelSerializer):
    
    # ---- 1. SỬA LỖI `TypeError` ----
    # (Xóa 'product_id = ...' và 'product = ...' thủ công)
    # Vì tên key trong JSON ('product_id') đã khớp với tên 
    # trường trong Model ('product_id'), ModelSerializer sẽ tự động xử lý.

    class Meta:
        model = Event
        fields = [
            'transaction_id', 
            'product_id', # <-- Chỉ cần dùng tên trường thật của model
            'order_status', 
            'assign_date', 
            'received_date'
        ]
        read_only_fields = ('transaction_id',) # ID là tự tăng
        
        # 'product_id' là bắt buộc khi tạo
        # Các trường khác là read_only (khi tạo) và sẽ được xử lý bởi update()
        extra_kwargs = {
            'order_status': {'read_only': True},
            'assign_date': {'read_only': True},
            'received_date': {'read_only': True},
        }

    def create(self, validated_data):
        # Yêu cầu của bạn: "tạo event mới(mặc định order_status và received_date là pending và null)"
        # 'pending' và 'null' đã là giá trị DEFAULT trong CSDL của bạn,
        # vì vậy chúng ta không cần làm gì thêm.
        
        # (Nếu bạn muốn 'assign_date' là ngày hôm nay khi tạo, hãy thêm dòng này)
        # from django.utils import timezone
        # validated_data['assign_date'] = timezone.now().date() 
        
        return super().create(validated_data)

    # ---- 2. SỬA LỖI LOGIC UPDATE ----
    def update(self, instance, validated_data):
        user = self.context['request'].user
        # Dùng 'self.initial_data' (JSON thô) để kiểm tra các trường read_only
        data = self.initial_data 

        if user.role == 'manager':
            # Manager được sửa mọi thứ
            instance.order_status = data.get('order_status', instance.order_status)
            instance.assign_date = data.get('assign_date', instance.assign_date)
            instance.received_date = data.get('received_date', instance.received_date)
        
        elif user.role == 'transporter':
            # Transporter CHỈ được sửa 2 trường này
            if 'order_status' in data:
                instance.order_status = data.get('order_status')
            if 'assign_date' in data:
                instance.assign_date = data.get('assign_date')
            
            # Kiểm tra nếu họ cố sửa trường bị cấm
            if 'received_date' in data:
                raise exceptions.PermissionDenied("Transporter không có quyền cập nhật received_date.")

        elif user.role == 'retailer':
            # Retailer CHỈ được sửa 1 trường này
            if 'received_date' in data:
                instance.received_date = data.get('received_date')
            
            # Kiểm tra nếu họ cố sửa trường bị cấm
            if 'order_status' in data or 'assign_date' in data:
                raise exceptions.PermissionDenied("Retailer không có quyền cập nhật order_status hoặc assign_date.")

        else:
            raise exceptions.PermissionDenied("Bạn không có quyền cập nhật Event.")

        instance.save()
        return instance


# --- Serializer MỚI cho TrackingEvent (Giữ nguyên) ---
class TrackingEventSerializer(serializers.ModelSerializer):
    
    transporter_name = serializers.CharField(source='transporter.transporter.name', read_only=True, allow_null=True)
    retailer_name = serializers.CharField(source='retailer.retailer.name', read_only=True, allow_null=True)
    
    class Meta:
        model = TrackingEvent
        fields = [
            'transaction',
            'transporter', 
            'transporter_name',
            'retailer', 
            'retailer_name'
        ]