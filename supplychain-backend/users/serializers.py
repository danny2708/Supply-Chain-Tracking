# users/serializers.py
from rest_framework import serializers
from .models import Account, Transporter, Retailer

class UserRegistrationSerializer(serializers.ModelSerializer):
    location = serializers.CharField(max_length=255, required=False,allow_blank=True)

    class Meta:
        model = Account
        # Phải khớp với REQUIRED_FIELDS + username/password
        fields = ['username', 'password', 'name', 'role','ipfs','location']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_id': {'read_only': True},
            'ipfs': {'required': False, 'allow_null': True},
            'location': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        # Gọi hàm create_user chuẩn (từ AccountManager)
        # Nó sẽ tự động băm mật khẩu
        location_data = validated_data.pop('location', None)
        role = validated_data.get('role', 'producer')
        user = Account.objects.create_user(**validated_data)
        # 2. LOGIC MỚI: Dựa trên 'role', tạo hồ sơ tương ứng
        try:
            if role == 'transporter':
                Transporter.objects.create(transporter=user)
            elif role == 'retailer':
                Retailer.objects.create(retailer=user, location=location_data)
            # Nếu là 'producer' thì không cần làm gì thêm
        
        except Exception as e:
            # Nếu có lỗi (ví dụ: location bị trùng), xóa user vừa tạo
            user.delete()
            raise serializers.ValidationError(f"Lỗi khi tạo hồ sơ: {e}")
        return user