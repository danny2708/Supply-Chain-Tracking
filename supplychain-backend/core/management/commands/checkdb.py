from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import ConnectionDoesNotExist, OperationalError

class Command(BaseCommand):
    help = 'Kiểm tra kết nối tới cơ sở dữ liệu PostgreSQL.'

    def handle(self, *args, **options):
        # Giả định tên kết nối là 'default'
        db_conn = connections['default']
        
        self.stdout.write(self.style.NOTICE("Đang kiểm tra kết nối PostgreSQL..."))

        try:
            # Phương thức này cố gắng thực hiện một truy vấn cơ bản để kiểm tra kết nối
            db_conn.ensure_connection()
            
        except ConnectionDoesNotExist:
            self.stdout.write(self.style.ERROR(
                "LỖI: Tên kết nối 'default' không tồn tại trong settings.py."
            ))
            return

        except OperationalError as e:
            self.stdout.write(self.style.ERROR(
                f"LỖI KẾT NỐI POSTGRESQL: Không thể kết nối tới DB '{db_conn.settings_dict.get('NAME')}'."
            ))
            self.stdout.write(self.style.ERROR(f"Chi tiết lỗi: {e}"))
            return

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f"LỖI KHÔNG XÁC ĐỊNH khi kết nối tới DB '{db_conn.settings_dict.get('NAME')}': {e}"
            ))
            return

        self.stdout.write(self.style.SUCCESS(
            f"Kết nối PostgreSQL thành công! DB: {db_conn.settings_dict.get('NAME')}."
        ))