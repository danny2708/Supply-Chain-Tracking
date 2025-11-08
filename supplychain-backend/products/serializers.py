# products/serializers.py
from rest_framework import serializers
from .models import Product
# (Import Account không cần thiết nếu bạn dùng logic context bên dưới)
# from users.models import Account 

class ProductSerializer(serializers.ModelSerializer):
    
    # --- THÊM LOGIC ĐỌC ---
    # Hiển thị tên của producer, không chỉ ID
    # 'source='user.name'' nghĩa là đi vào model 'user' và lấy trường 'name'
    username = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Product
        
        # --- CẬP NHẬT FIELDS ---
        # Thêm 'ipfs' và 'username' (trường ảo)
        fields = [
            'product_id', 
            'name', 
            'manufacture_date', 
            'expiry_date', 
            'user',  # Đây là ID của producer (chỉ để GHI)
            'username', # Đây là TÊN của producer (chỉ để ĐỌC)
            'ipfs'
        ]
        
        # 'user' sẽ được tự động gán, không cần user nhập vào
        extra_kwargs = {
            'user': {'read_only': True}
        }

    # --- LOGIC TẠO SẢN PHẨM MỚI ---
    def create(self, validated_data):
        # 1. Lấy 'user' (producer) từ 'context'
        # (Chúng ta sẽ truyền context này từ views.py)
        user = self.context['request'].user
        
        # 2. Kiểm tra quyền (nếu cần)
        if user.role != 'producer':
            raise serializers.ValidationError("Chỉ có producer mới được tạo sản phẩm.")

        # 3. Tự động gán producer này vào sản phẩm
        validated_data['user'] = user
        
        # 4. Tạo sản phẩm
        return super().create(validated_data)