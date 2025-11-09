# supplychain_backend/settings.py
import os
<<<<<<< HEAD
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    # Định nghĩa kiểu dữ liệu mặc định cho các biến env
    DEBUG=(bool, False),
    CONTRACT_ADDRESS=(str, ""), # Khai báo kiểu string mặc định rỗng
    BLOCKCHAIN_PROVIDER_URL=(str, "http://localhost:8545"), # Khai báo kiểu string
    BACKEND_WALLET_PRIVATE_KEY=(str, "")
)
# Đọc file .env
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY') # Tốt hơn nên dùng env() cho SECRET_KEY
BACKEND_WALLET_PRIVATE_KEY = env('BACKEND_WALLET_PRIVATE_KEY')
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# === KHAI BÁO BIẾN BLOCKCHAIN ===
CONTRACT_ADDRESS = env('CONTRACT_ADDRESS')
BLOCKCHAIN_PROVIDER_URL = env('BLOCKCHAIN_PROVIDER_URL')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'  # Trỏ đến app 'users' và model 'Account'


=======
from dotenv import load_dotenv
from pathlib import Path

# --- THÊM LOGIC TẢI .ENV ---
# (BASE_DIR phải được định nghĩa ở trên cùng)
BASE_DIR = Path(__file__).resolve().parent.parent

# Tải file .env từ thư mục gốc (nơi có manage.py)
load_dotenv(os.path.join(BASE_DIR, '.env'))
# ------------------------------

SECRET_KEY = 'maomaoisgoodcat3'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'
DEBUG = True
>>>>>>> origin/mao_backend_workplaces
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
    'rest_framework_simplejwt',
    
    # Các app của bạn
    'core',
    'users',
    'products',
    'tracking',
    'certificates',
    'ipfs',
    'app', # <-- (Giả sử 'app' là tên app chứa 'blockchain_service.py')
]

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
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
<<<<<<< HEAD
        'PASSWORD': 'chuvoiconobandon',
        'HOST': 'localhost', # Hoặc địa chỉ server DB
=======
        'PASSWORD': '0comatkhau',
        'HOST': 'localhost',
>>>>>>> origin/mao_backend_workplaces
        'PORT': '5432',
    }
}
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
STATIC_URL = '/static/'
ROOT_URLCONF = 'supplychain_backend.urls'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
SIMPLE_JWT = {
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',
}
# (Dấu '}' bị lạc của bạn đã được sửa)

# ---- THÊM CÁC DÒNG NÀY VÀO CUỐI ----
# Đọc các biến từ .env (đã được load) và gán vào Settings
BACKEND_WALLET_PRIVATE_KEY = os.getenv('BACKEND_WALLET_PRIVATE_KEY')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')

# Tệp blockchain_service.py của bạn tìm 'BLOCKCHAIN_PROVIDER_URL',
# vì vậy chúng ta gán nó từ 'INFURA_URL' của .env
BLOCKCHAIN_PROVIDER_URL = os.getenv('INFURA_URL')