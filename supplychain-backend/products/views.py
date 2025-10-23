# products/views.py
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép xem (GET) và tạo (POST) Products.
    """
    queryset = Product.objects.all().order_by('product_id')
    serializer_class = ProductSerializer