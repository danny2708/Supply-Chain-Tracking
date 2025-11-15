# tracking/serializers.py
from rest_framework import serializers
from .models import Event, TrackingEvent
# (Chúng ta không cần import Product ở đây cho EventSerializer nữa)

# --- Serializer MỚI cho Event (Đã sửa) ---
class EventSerializer(serializers.ModelSerializer):
    
    # (Chúng ta không cần định nghĩa 'product_id' thủ công nữa)
    # ModelSerializer sẽ tự động xử lý nó,
    # vì 'product_id' (trong JSON) khớp với 'product_id' (trong Model)

    class Meta:
        model = Event
        # Chỉ cần liệt kê các trường CSDL
        fields = [
            'transaction_id', 
            'product_id', # <-- Tên trường thật trong model
            'order_status', 
            'assign_date', 
            'received_date'
        ]
        read_only_fields = ('transaction_id',) # transaction_id là tự tăng

# --- Serializer MỚI cho TrackingEvent (Đã cải tiến) ---
class TrackingEventSerializer(serializers.ModelSerializer):
    
    # (Cải tiến này để API /history/ của bạn đẹp hơn)
    transporter_name = serializers.CharField(source='transporter.transporter.name', read_only=True, allow_null=True)
    retailer_name = serializers.CharField(source='retailer.retailer.name', read_only=True, allow_null=True)
    
    class Meta:
        model = TrackingEvent
        fields = [
            'transaction',      # ID của Event (để GHI)
            'transporter',      # ID của Transporter (để GHI)
            'transporter_name', # Tên (để ĐỌC)
            'retailer',         # ID của Retailer (để GHI)
            'retailer_name'     # Tên (để ĐỌC)
        ]