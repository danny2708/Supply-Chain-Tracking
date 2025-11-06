# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

# 1. Chúng ta PHẢI tạo một "Manager" tùy chỉnh
# Nó định nghĩa cách hàm "create_user" (dùng cho API)
# và "create_superuser" (dùng cho terminal) hoạt động
class AccountManager(BaseUserManager):
    def create_user(self, username, password, name, role='producer'):
        if not username:
            raise ValueError('User phải có username')
        
        user = self.model(
            username=username,
            name=name,
            role=role,
        )
        # Tự động băm mật khẩu
        user.password = make_password(password) 
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, name, role='producer'):
        # Lệnh 'python manage.py createsuperuser' sẽ gọi hàm này
        user = self.create_user(
            username=username,
            password=password,
            name=name,
            role=role,
        )
        # Bảng 'account' của bạn không có cột 'is_admin' hay 'is_staff'
        # nên chúng ta không gán các giá trị đó
        user.save(using=self._db)
        return user

# 2. Sửa Model để kế thừa từ 'AbstractBaseUser'
class Account(AbstractBaseUser):
    # Khớp 100% với SQL của bạn
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    # Cột 'password' đã được kế thừa từ AbstractBaseUser
    role = models.CharField(max_length=20)
    name = models.CharField(max_length=50)

    # Cột 'last_login' cũng được kế thừa (bắt buộc)
    # THÊM DÒNG NÀY ĐỂ KHỚP VỚI CỘT BẠN VỪA TẠO
    last_login = models.DateTimeField(blank=True, null=True)

    # Chỉ định Manager tùy chỉnh
    objects = AccountManager()

    # Chỉ định trường nào dùng để Login
    USERNAME_FIELD = 'username'
    
    # Chỉ định các trường BẮT BUỘC khi tạo user
    # (Đây chính là thuộc tính bị thiếu gây ra lỗi)
    REQUIRED_FIELDS = ['name', 'role'] 

    class Meta:
        managed = False      # Cấm Django đụng vào
        db_table = 'account' # Trỏ vào bảng nguyên bản

    def __str__(self):
        return self.username
    
    # ----- Các hàm bắt buộc cho AbstractBaseUser -----
    
    def has_perm(self, perm, obj=None):
        "User có quyền cụ thể không?"
        return True # Tạm thời cho phép tất cả

    def has_module_perms(self, app_label):
        "User có quyền xem app không?"
        return True # Tạm thời cho phép tất cả
        
    @property
    def is_staff(self):
        "User có phải là staff không (để vào trang Admin)?"
        # Giả sử ai có role 'producer' là staff (bạn có thể đổi)
        return self.role == 'producer'