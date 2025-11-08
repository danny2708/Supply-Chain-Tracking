# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

# --- AccountManager (Đã chính xác) ---
class AccountManager(BaseUserManager):
    def create_user(self, username, password, name, role='producer', **extra_fields):
        if not username:
            raise ValueError('User phải có username')
        
        user = self.model(
            username=username,
            name=name,
            role=role,
            **extra_fields
        )
        user.password = make_password(password) 
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, name, role='producer', **extra_fields):
        user = self.create_user(
            username=username,
            password=password,
            name=name,
            role=role,
            **extra_fields
        )
        user.save(using=self._db)
        return user

# --- Account Model (Đã sửa lỗi trùng lặp) ---
class Account(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20)
    name = models.CharField(max_length=100) # (Sửa thành 100 để khớp CSDL)
    last_login = models.DateTimeField(blank=True, null=True)
    ipfs = models.CharField(max_length=255, blank=True, null=True)
    
    objects = AccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['name', 'role'] 

    class Meta:
        managed = False
        db_table = 'account'

    def __str__(self):
        return self.username
    
    @property
    def is_active(self):
        "Tài khoản có được kích hoạt không?"
        return True

    @property
    def is_staff(self):
        "User có phải là staff không (để vào trang Admin)?"
        return self.role == 'producer'

    @property
    def is_superuser(self):
        "User có phải là superuser không?"
        return self.role == 'producer'
    
    # ----- Các hàm bắt buộc cho AbstractBaseUser -----
    
    def has_perm(self, perm, obj=None):
        "User có quyền cụ thể không?"
        return self.is_superuser

    def has_module_perms(self, app_label):
        "User có quyền xem app không?"
        return self.is_superuser
    
    # (ĐÃ XÓA HÀM 'is_staff' BỊ TRÙNG LẶP Ở ĐÂY)
    
# --- Model Transporter (Đã sửa db_table) ---
class Transporter(models.Model):
    transporter = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='transporter_id'
    )
    
    class Meta:
        managed = False
        db_table = 'transporter' # <-- SỬA LỖI Ở ĐÂY

# --- Model Retailer (Không đổi) ---
class Retailer(models.Model):
    retailer = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='retailer_id'
    )
    location = models.TextField(blank=True, null=True, unique=True)

    class Meta:
        managed = False
        db_table = 'retailer'