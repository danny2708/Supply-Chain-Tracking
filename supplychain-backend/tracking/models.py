# tracking/models.py
from django.db import models

# Import các model từ các ứng dụng khác
from products.models import Product
from users.models import Transporter, Retailer 

# --- Model MỚI: Event ---
# Bảng này mô tả "cái gì" đã xảy ra (ví dụ: một giao dịch đã bắt đầu).
class Event(models.Model):
    # Khớp 100% với CSDL
    transaction_id = models.AutoField(primary_key=True)
    product_id = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        db_column='product_id' # Khớp tên cột SQL
    )
    # Khớp với ENUM 'status'
    order_status = models.CharField(max_length=20, default='pending') 
    assign_date = models.DateField(blank=True, null=True)
    received_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False      # QUAN TRỌNG: Để Django không sửa bảng
        db_table = 'event'   # QUAN TRỌNG: Tên bảng trong CSDL

    def __str__(self):
        return f"Event {self.transaction_id} cho {self.product_id}"


# --- Model MỚI: TrackingEvent ---
# Bảng này mô tả "ai" đã tham gia vào Event.
class TrackingEvent(models.Model):
    # Dùng OneToOneField làm Khóa chính (PK) VÀ Khóa ngoại (FK)
    # Điều này tạo ra mối quan hệ 1-1 với bảng 'Event'
    transaction = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='transaction_id' # Khớp tên cột SQL
    )
    
    # Khóa ngoại trỏ đến hồ sơ Transporter
    transporter = models.ForeignKey(
        Transporter,
        on_delete=models.SET_NULL,
        null=True,
        db_column='transporter_id' # Khớp tên cột SQL
    )
    
    # Khóa ngoại trỏ đến hồ sơ Retailer
    # 'blank=True' và 'null=True' RẤT QUAN TRỌNG
    # để xử lý trường hợp 'đang vận chuyển, chưa có retailer'
    retailer = models.ForeignKey(
        Retailer,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='retailer_id' # Khớp tên cột SQL
    )

    class Meta:
        managed = False
        db_table = 'tracking_event'

    def __str__(self):
        return f"Tracking cho Event {self.transaction_id}"