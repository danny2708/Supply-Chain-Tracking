# tracking/views.py
from rest_framework import viewsets, permissions
from .models import Event, TrackingEvent
from .serializers import EventSerializer, TrackingEventSerializer
# Import các class quyền mới
from core.permissions import IsManager, IsProducer, IsRetailer, IsTransporter

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho Events.
    - GET: Mọi người
    - POST: Chỉ Retailer (theo yêu cầu)
    - PATCH: Retailer, Transporter, Manager (logic trong Serializer)
    - DELETE: Chỉ Manager
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        """Gán quyền dựa trên hành động (action)."""
        if self.action == 'create':
            # Chỉ Retailer được TẠO
            self.permission_classes = [IsRetailer]
        
        elif self.action in ['update', 'partial_update']:
            # Chỉ 3 vai trò này được phép SỬA
            self.permission_classes = [IsManager | IsRetailer | IsTransporter]
        
        elif self.action == 'destroy':
            # Chỉ Manager được XÓA
            self.permission_classes = [IsManager]
            
        else:
            # list, retrieve (GET)
            # Mọi người (đã đăng nhập) đều được XEM
            self.permission_classes = [permissions.AllowAny]
        
        return super().get_permissions()

class TrackingEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint gán Transporter/Retailer cho một Event.
    - GET: Mọi người
    - POST: Producer hoặc Manager
    - PUT/PATCH/DELETE: Chỉ Manager
    """
    queryset = TrackingEvent.objects.all()
    serializer_class = TrackingEventSerializer

    def get_permissions(self):
        """Gán quyền dựa trên hành động (action)."""
        if self.action == 'create':
            # Giả sử Producer (người tạo Event) hoặc Manager gán
            self.permission_classes = [IsProducer | IsManager]
        
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Chỉ Manager được sửa/xóa
            self.permission_classes = [IsManager]
        
        else:
            # list, retrieve (GET)
            # Mọi người (đã đăng nhập) đều được XEM
            self.permission_classes = [permissions.IsAuthenticated]
        
        return super().get_permissions()