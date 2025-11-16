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

class TransporterSerializer(serializers.ModelSerializer):
    """
    Serializer này hiển thị thông tin hồ sơ Transporter (Chỉ đọc).
    """
    # Lấy 'name' từ model Account liên quan
    name = serializers.CharField(source='transporter.name', read_only=True)
    
    class Meta:
        model = Transporter
        fields = [
            'transporter_id', # Đây chính là user_id
            'name'
            # (Bạn có thể thêm các trường profile khác ở đây)
        ]

class RetailerSerializer(serializers.ModelSerializer):
    """
    Serializer này hiển thị thông tin hồ sơ Retailer (Chỉ đọc).
    """
    # Lấy 'name' từ model Account liên quan
    name = serializers.CharField(source='retailer.name', read_only=True)
    
    class Meta:
        model = Retailer
        fields = [
            'retailer_id', # Đây chính là user_id
            'name', 
            'location'
            # (Bạn có thể thêm các trường profile khác ở đây)
        ]