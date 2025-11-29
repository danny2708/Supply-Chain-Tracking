from django.apps import AppConfig

# Đặt tên class cấu hình theo tên ứng dụng của bạn
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'  # Tên module của ứng dụng