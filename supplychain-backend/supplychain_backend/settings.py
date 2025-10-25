# supplychain_backend/settings.py
import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    # Định nghĩa kiểu dữ liệu mặc định cho các biến env
    DEBUG=(bool, False),
    CONTRACT_ADDRESS=(str, ""), # Khai báo kiểu string mặc định rỗng
    BLOCKCHAIN_PROVIDER_URL=(str, "http://localhost:8545") # Khai báo kiểu string
)
# Đọc file .env
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY') # Tốt hơn nên dùng env() cho SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# === KHAI BÁO BIẾN BLOCKCHAIN ===
CONTRACT_ADDRESS = env('CONTRACT_ADDRESS')
BLOCKCHAIN_PROVIDER_URL = env('BLOCKCHAIN_PROVIDER_URL')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'  # Trỏ đến app 'users' và model 'Account'


ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Thư viện bên thứ ba
    'rest_framework',
    'corsheaders',
    # Các app của bạn
    'core',
    'users',
    'products',  # <--- THÊM VÀO ĐÂY
    'tracking',
    'certificates',
    'ipfs',
]
# supplychain_backend/settings.py

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True, # Rất quan trọng: cho phép Django tìm template trong các app
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Thêm dòng này (E410) - PHẢI đứng TRƯỚC AuthenticationMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware', 
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    # Thêm dòng này (E408)
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    # Thêm dòng này (E409)
    'django.contrib.messages.middleware.MessageMiddleware', 
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# (Đảm bảo bạn cũng đã cấu hình DATABASES để trỏ đến PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'chuvoiconobandon',
        'HOST': 'localhost', # Hoặc địa chỉ server DB
        'PORT': '5432',
    }
}
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Địa chỉ của frontend (ví dụ Next.js)
    "http://127.0.0.1:3000",
]
STATIC_URL = '/static/'
ROOT_URLCONF = 'supplychain_backend.urls'