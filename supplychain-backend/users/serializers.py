# users/serializers.py
from rest_framework import serializers
from .models import Account

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        # Phải khớp với REQUIRED_FIELDS + username/password
        fields = ['username', 'password', 'name', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_id': {'read_only': True},
        }

    def create(self, validated_data):
        # Gọi hàm create_user chuẩn (từ AccountManager)
        # Nó sẽ tự động băm mật khẩu
        user = Account.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            name=validated_data['name'],
            role=validated_data.get('role', 'producer')
        )
        return user