# tracking/views.py
from rest_framework import viewsets, permissions # <-- 1. IMPORT PERMISSIONS
# Import model và serializer MỚI
from .models import Event, TrackingEvent
from .serializers import EventSerializer, TrackingEventSerializer

# --- ViewSet MỚI cho Event ---
class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép tạo, xem, sửa, xóa các Events.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated] # <-- 2. THÊM BẢO VỆ

# --- ViewSet SỬA ĐỔI cho TrackingEvent ---
class TrackingEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép gán Transporter/Retailer cho một Event.
    """
    queryset = TrackingEvent.objects.all()
    serializer_class = TrackingEventSerializer
    permission_classes = [permissions.IsAuthenticated] # <-- 3. THÊM BẢO VỆ