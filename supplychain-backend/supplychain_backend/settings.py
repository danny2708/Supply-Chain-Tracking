import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url # CẦN IMPORT THÊM CÁI NÀY

# === ĐỊNH NGHĨA ĐƯỜNG DẪN CƠ BẢN ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === TẢI FILE .ENV ===
load_dotenv(os.path.join(BASE_DIR, '.env'))

# === CẤU HÌNH CHÍNH ===
# Lấy từ env, nếu không có thì dùng key tạm (chỉ an toàn khi dev)
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-key-change-me-in-prod')

# Quan trọng: Trên Railway phải đặt biến môi trường DEBUG=False
# Code này sẽ tự hiểu: nếu không có biến DEBUG thì mặc định là False (An toàn)
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# === ALLOWED_HOSTS ===
# Cho phép tất cả các host trên Railway hoặc localhost
ALLOWED_HOSTS = ['*']
# Hoặc nếu muốn chặt chẽ hơn: os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'

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
    'rest_framework_simplejwt',
    
    # Các app của bạn
    'core',
    'users',
    'products',
    'tracking',
    'certificates',
    'ipfs',
    'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # THÊM DÒNG NÀY ĐỂ RAILWAY HIỂN THỊ CSS ADMIN
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

# === CẤU HÌNH DATABASE (QUAN TRỌNG) ===
# Logic này sẽ ưu tiên biến DATABASE_URL (Cách 1).
# Nếu không có DATABASE_URL, nó mới tự ghép từ các biến lẻ (Cách 2).
database_url_config = dj_database_url.config(conn_max_age=600)

if not database_url_config:
    # Fallback cho trường hợp không set DATABASE_URL mà set biến lẻ
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
# Lấy list domain frontend từ biến môi trường, hoặc mặc định cho phép localhost
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')

# Railway dùng HTTPS, cần dòng này để Django tin tưởng request từ domain này
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')
# Ví dụ trên Railway bạn sẽ set CSRF_TRUSTED_ORIGINS = https://ten-du-an.up.railway.app

# Cho phép header Authorization (JWT)
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