#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    
    # DÒNG QUAN TRỌNG:
    # Nó chỉ cho Django biết tệp settings.py của bạn nằm ở đâu.
    # Dựa trên cấu trúc của bạn, nó là 'tên_thư_mục_config.settings'
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supplychain_backend.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Không thể import Django. Bạn có chắc là nó đã được cài đặt và "
            "có sẵn trong biến môi trường PYTHONPATH không? "
            "Bạn đã kích hoạt virtual environment (môi trường ảo) chưa?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()