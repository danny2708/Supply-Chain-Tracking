# supplychain_backend/settings.py
SECRET_KEY = 'maomaoisgoodcat3'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.Account'  # Trỏ đến app 'users' và model 'Account'
DEBUG = True
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