# products/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import Product

DEFAULT_IPFS_GATEWAY = getattr(settings, "IPFS_GATEWAY_URL", "https://gateway.pinata.cloud/ipfs/")

class ProductSerializer(serializers.ModelSerializer):
    # Hiển thị tên của producer, không chỉ ID
    username = serializers.CharField(source='user.name', read_only=True)

    # Cho phép client gửi CID hoặc URL (không bắt buộc)
    ipfs = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'product_id',
            'name',
            'description',
            'manufacture_date',
            'expiry_date',
            'user',      # Ghi: ID
            'username',  # Đọc: tên producer
            'ipfs'
        ]
        extra_kwargs = {
            'user': {'read_only': True},
            'on_chain_status': {'read_only': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True}
        }

    def validate_ipfs(self, value):
        """
        Accept either:
         - full url (http(s)://...)
         - raw CID (Qm... or bafy...)
        Normalize to: {IPFS_GATEWAY_URL}{cid_or_path}
        If empty/None -> return empty string.
        """
        if not value:
            return ""

        value = value.strip()
        # If already a full URL
        if value.startswith("http://") or value.startswith("https://"):
            return value

        # If contains '/ipfs/' or has extra path (e.g. cid/path/to/file)
        # just append after gateway
        cid_or_path = value.lstrip("/")
        return DEFAULT_IPFS_GATEWAY.rstrip("/") + "/" + cid_or_path

    def create(self, validated_data):
        # lấy user từ context.request
        user = self.context['request'].user

        # kiểm tra quyền
        if getattr(user, "role", None) != 'producer':
            raise serializers.ValidationError("Chỉ có producer mới được tạo sản phẩm.")

        # normalise ipfs (in case validated_data contains raw cid)
        ipfs_val = validated_data.get("ipfs", "") or ""
        # run through validate_ipfs manually if serializer.validate_* not called (safe)
        ipfs_val = self.validate_ipfs(ipfs_val)
        validated_data['ipfs'] = ipfs_val

        # gán user, trạng thái pending cho process queue
        validated_data['user'] = user
        validated_data['on_chain_status'] = 'pending'

        product = super().create(validated_data)

        print(f"\n--- [RUNSERVER]: Đã thêm {product.product_id} vào hàng đợi (pending) ---")
        return product
