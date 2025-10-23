# products/models.py
from django.db import models
from django.conf import settings

class Product(models.Model):
    # Khớp chính xác với cột 'product_id varchar(100) PRIMARY KEY'
    product_id = models.CharField(max_length=100, primary_key=True)
    
    name = models.CharField(max_length=255)
    manufacture_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    
    # Khớp với 'user_id int references account(user_id)'
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        db_column="user_id" # Chỉ định tên cột THẬT
    )

    class Meta:
        db_table = 'product' # Tên bảng THẬT
        managed = False      # CẤM đụng vào 
    
    def __str__(G):
        return f"{self.name} ({self.product_id})"