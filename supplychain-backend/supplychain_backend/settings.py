import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# === ĐỊNH NGHĨA ĐƯỜNG DẪN CƠ BẢN ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === TẢI FILE .ENV ===
load_dotenv(os.path.join(BASE_DIR, '.env'))

# === CẤU HÌNH CHÍNH ===
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-key-change-me-in-prod')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# === ALLOWED_HOSTS (Đã sửa: Thêm domain Railway vào default) ===
# Biến này phải chứa domain Railway và Vercel (nếu Vercel truy cập trực tiếp)
ALLOWED_HOSTS_DEFAULT = ['127.0.0.1', 'localhost', 'supply-chain-tracking-production.up.railway.app']
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', ','.join(ALLOWED_HOSTS_DEFAULT)).split(',')

# Thêm wildcards cho Railway nếu cần
if not ALLOWED_HOSTS or ALLOWED_HOSTS == ['']:
    ALLOWED_HOSTS = ['*']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'

# === INSTALLED_APPS (Giữ nguyên cấu hình AppConfig) ===
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
    
    # Các app của bạn
    'core', 
    'users.apps.UsersConfig',
    'products',
    'tracking',
    'certificates',
    'ipfs',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
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

# === CẤU HÌNH DATABASE (Đã giải quyết lỗi DB) ===
database_url_config = dj_database_url.config(conn_max_age=600)

if not database_url_config:
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

# === CORS & CSRF (Cấu hình trao đổi Credentials) ===
# 🚨 QUAN TRỌNG: Thêm CORS_ALLOW_CREDENTIALS
CORS_ALLOW_CREDENTIALS = True 

# Đảm bảo domain Vercel được liệt kê
# Cần phải là https://supply-chain-tracking-five.vercel.app
CORS_ALLOWED_ORIGINS_DEFAULT = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://supply-chain-tracking-five.vercel.app', # <-- Thêm domain Frontend
]
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', ','.join(CORS_ALLOWED_ORIGINS_DEFAULT)).split(',')


# Cần thiết cho các request POST từ Vercel
CSRF_TRUSTED_ORIGINS_DEFAULT = [
    'http://localhost:3000',
    'https://supply-chain-tracking-five.vercel.app', # <-- Thêm domain Vercel
]
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', ','.join(CSRF_TRUSTED_ORIGINS_DEFAULT)).split(',')


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

# === STATIC FILES ===
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