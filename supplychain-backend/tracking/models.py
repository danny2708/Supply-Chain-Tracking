# tracking/models.py
from django.db import models
from users.models import Account
from products.models import Product

# (Class Status giữ nguyên)
class Status(models.TextChoices):
    PENDING = 'pending', 'Pending'
    IN_TRANSIT = 'in_transit', 'In Transit'
    DELIVERED = 'delivered', 'Delivered'

class TrackingEvent(models.Model):
    transaction_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        db_column="product_id"
    )
    
    class Meta:
        managed = False
        db_table = 'tracking_event'

class Transporter(models.Model):
    name = models.CharField(max_length=100) # (Đây là cột name thông thường)
    user = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        primary_key=True,       # <-- Chỉ định đây là Khóa chính
        db_column="user_id"
    )
    order_status = models.CharField(max_length=20, default='pending')
    assign_date = models.DateField(null=True, blank=True)
    transaction = models.ForeignKey(
        TrackingEvent,
        on_delete=models.SET_NULL,
        null=True,
        db_column="transaction_id"
    )
    
    class Meta:
        managed = False
        db_table = 'transporter'

class Retailer(models.Model):  
    name = models.CharField(max_length=100) # (Đây là cột name thông thường)
    user = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        primary_key=True,       # <-- Chỉ định đây là Khóa chính
        db_column="user_id"
    )
    location = models.TextField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    transaction = models.ForeignKey(
        TrackingEvent,
        on_delete=models.SET_NULL,
        null=True,
        db_column="transaction_id"
    )
    
    class Meta:
        managed = False
        db_table = 'retailer'