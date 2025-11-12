# tracking/serializers.py
from rest_framework import serializers
from .models import Event, TrackingEvent # Import model mới

# --- Serializer MỚI cho Event ---
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        # transaction_id là tự tăng, nên nó là read_only
        read_only_fields = ['transaction_id'] 

# --- Serializer MỚI cho TrackingEvent ---
class TrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = '__all__'
        # 'transaction' là khóa chính, nhưng cũng là trường 
        # bạn phải cung cấp (ID của event) khi tạo