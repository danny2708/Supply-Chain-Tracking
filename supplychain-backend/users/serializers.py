# users/serializers.py
from rest_framework import serializers
# 1. Import thêm Transporter và Retailer
from .models import Account, Transporter, Retailer 

# (Class UserRegistrationSerializer của bạn đã CHÍNH XÁC, giữ nguyên)
class UserRegistrationSerializer(serializers.ModelSerializer):
    location = serializers.CharField(max_length=255, required=False,allow_blank=True)

    class Meta:
        model = Account
        fields = ['username', 'password', 'name', 'role','ipfs','location']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_id': {'read_only': True},
            'ipfs': {'required': False, 'allow_null': True},
            'location': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        location_data = validated_data.pop('location', None)
        role = validated_data.get('role', 'producer')
        user = Account.objects.create_user(**validated_data)
        try:
            if role == 'transporter':
                Transporter.objects.create(transporter=user)
            elif role == 'retailer':
                Retailer.objects.create(retailer=user, location=location_data)
        
        except Exception as e:
            user.delete()
            raise serializers.ValidationError(f"Lỗi khi tạo hồ sơ: {e}")
        return user

# ----------------------------------------------
# ---- 2. THÊM CÁC CLASS MỚI VÀO CUỐI TỆP ----
# ----------------------------------------------
class AccountSerializer(serializers.ModelSerializer):
    """
    Serializer dùng để lấy thông tin cơ bản của User (bao gồm Role).
    """
    class Meta:
        model = Account
        fields = ['user_id', 'username', 'name', 'role', 'ipfs']
        read_only_fields = ['user_id']

class TransporterSerializer(serializers.ModelSerializer):
    """
    Serializer này hiển thị thông tin hồ sơ Transporter (Chỉ đọc).
    """
    # Lấy 'name' từ model Account liên quan
    name = serializers.CharField(source='transporter.name')
    # Lấy ID của User gốc (để check sang account)
    user = serializers.PrimaryKeyRelatedField(source='transporter', read_only=True)
    # Lấy trạng thái Active (để hiển thị nút Khóa)
    is_active = serializers.BooleanField(source='transporter.is_active', read_only=True)
    
    class Meta:
        model = Transporter
        fields = ['transporter_id', 'name', 'user', 'is_active']

    def update(self, instance, validated_data):
        # Lấy dữ liệu name từ nested source 'transporter.name'
        transporter_data = validated_data.pop('transporter', {})
        new_name = transporter_data.get('name')

        # Cập nhật tên trong bảng Account
        if new_name:
            account = instance.transporter
            account.name = new_name
            account.save()

        return super().update(instance, validated_data)

class RetailerSerializer(serializers.ModelSerializer):
    """
    Serializer này hiển thị thông tin hồ sơ Retailer (Chỉ đọc).
    """
    # Lấy 'name' từ model Account liên quan
    name = serializers.CharField(source='retailer.name')
    user = serializers.PrimaryKeyRelatedField(source='retailer', read_only=True)
    is_active = serializers.BooleanField(source='retailer.is_active', read_only=True)
    
    class Meta:
        model = Retailer
        fields = ['retailer_id', 'name', 'location', 'user', 'is_active']

    def update(self, instance, validated_data):
        # Cập nhật tên vào bảng Account
        retailer_data = validated_data.pop('retailer', {})
        new_name = retailer_data.get('name')

        if new_name:
            account = instance.retailer
            account.name = new_name
            account.save()

        # Cập nhật location (bảng Retailer) - cái này super().update tự làm được
        return super().update(instance, validated_data)