from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    """Chỉ cho phép Manager."""
    def has_permission(self, request, view):
        return request.user.role == 'manager'

class IsProducer(BasePermission):
    """Chỉ cho phép Producer."""
    def has_permission(self, request, view):
        return request.user.role == 'producer'

class IsRetailer(BasePermission):
    """Chỉ cho phép Retailer."""
    def has_permission(self, request, view):
        return request.user.role == 'retailer'

class IsTransporter(BasePermission):
    """Chỉ cho phép Transporter."""
    def has_permission(self, request, view):
        return request.user.role == 'transporter'

class IsOwner(BasePermission):
    """
    Chỉ cho phép chủ sở hữu của object (dùng cho Product).
    """
    def has_object_permission(self, request, view, obj):
        # 'obj' ở đây là Product
        return obj.user == request.user