# products/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        # PHẢI bao gồm 'product_id'
        fields = ['product_id', 'name', 'manufacture_date', 'expiry_date', 'user']