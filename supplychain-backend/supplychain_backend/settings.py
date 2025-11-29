import os
import sys # Cần thiết cho việc sửa lỗi đường dẫn nếu cần
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# === ĐỊNH NGHĨA ĐƯỜNG DẪN CƠ BẢN ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === TẢI FILE .ENV ===
load_dotenv(os.path.join(BASE_DIR, '.env'))

# === CẤU HÌNH CHÍNH ===
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-key-change-me-in-prod')
# Quan trọng: Trên Railway phải đặt biến môi trường DEBUG=False
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# === ALLOWED_HOSTS ===
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ['*']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'

# === INSTALLED_APPS (KHẮC PHỤC LỖI XUNG ĐỘT ĐƯỜNG DẪN) ===
# Chúng ta sẽ sử dụng AppConfig Class để chỉ định rõ ràng đường dẫn
INSTALLED_APPS = [
    # Mặc định
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Thư viện bên thứ ba
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    
    # Các app của bạn (Sử dụng AppConfig Class để tránh xung đột path)
    # Dựa trên cấu trúc: users (ảnh 2), app (ảnh 1)
    # LƯU Ý: Nếu app 'core' không phải là app Django, hãy xóa nó
    'core', 
    'users.apps.UsersConfig',
    'products',
    'tracking',
    'certificates',
    'ipfs',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # THÊM DÒNG NÀY ĐỂ RAILWAY HIỂN THỊ CSS ADMIN
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'supplychain_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
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

# === CẤU HÌNH DATABASE (ĐÃ GIẢI QUYẾT LỖI DB) ===
database_url_config = dj_database_url.config(conn_max_age=600)

if not database_url_config:
    # Fallback cho trường hợp không set DATABASE_URL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'postgres'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': database_url_config
    }

# === CORS & CSRF (QUAN TRỌNG CHO NEXT.JS) ===
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# === STATIC FILES (QUAN TRỌNG CHO ADMIN PAGE) ===
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# === REST FRAMEWORK ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# === JWT SETTINGS ===
from datetime import timedelta
SIMPLE_JWT = {
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# === BIẾN MÔI TRƯỜNG CHO BLOCKCHAIN / WALLET ===
BACKEND_WALLET_PRIVATE_KEY = os.getenv('BACKEND_WALLET_PRIVATE_KEY')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
BLOCKCHAIN_PROVIDER_URL = os.getenv('BLOCKCHAIN_PROVIDER_URL')

# === CẤU HÌNH PINATA / IPFS ===
PINATA_API_KEY = os.getenv('PINATA_API_KEY') 
PINATA_API_SECRET = os.getenv('PINATA_API_SECRET') 
PINATA_JWT = os.getenv('PINATA_JWT') 

PINATA_BASE_URL = "https://api.pinata.cloud"
PINATA_PIN_FILE_URL = f"{PINATA_BASE_URL}/pinning/pinFileToIPFS"
PINATA_PIN_JSON_URL = f"{PINATA_BASE_URL}/pinning/pinJSONToIPFS"
PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/"