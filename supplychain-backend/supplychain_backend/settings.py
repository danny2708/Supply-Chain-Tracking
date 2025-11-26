import os
from pathlib import Path
from dotenv import load_dotenv

# === ĐỊNH NGHĨA ĐƯỜNG DẪN CƠ BẢN ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === TẢI FILE .ENV ===
load_dotenv(os.path.join(BASE_DIR, '.env'))

# === CẤU HÌNH CHÍNH ===
SECRET_KEY = os.getenv('SECRET_KEY', 'thằng nào sửa cái này là gay')  

# DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

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
    'app',  # App chứa blockchain_service.py
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
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

# === CẤU HÌNH DATABASE ===
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

# === CORS ===
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# === STATIC FILES ===
STATIC_URL = '/static/'

# === REST FRAMEWORK ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# === JWT SETTINGS ===
SIMPLE_JWT = {
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',
}

# === BIẾN MÔI TRƯỜNG CHO BLOCKCHAIN / WALLET ===
BACKEND_WALLET_PRIVATE_KEY = os.getenv('BACKEND_WALLET_PRIVATE_KEY')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
BLOCKCHAIN_PROVIDER_URL = os.getenv('INFURA_URL')

# === CẤU HÌNH PINATA / IPFS ===
PINATA_API_KEY = os.getenv('PINATA_API_KEY') 
PINATA_API_SECRET = os.getenv('PINATA_API_SECRET') 
PINATA_JWT = os.getenv('PINATA_JWT') 

# Endpoint mặc định của Pinata
PINATA_BASE_URL = "https://api.pinata.cloud"
PINATA_PIN_FILE_URL = f"{PINATA_BASE_URL}/pinning/pinFileToIPFS"
PINATA_PIN_JSON_URL = f"{PINATA_BASE_URL}/pinning/pinJSONToIPFS"
PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/"
