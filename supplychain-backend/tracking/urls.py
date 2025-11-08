# tracking/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Đăng ký 2 bộ API MỚI
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'tracking-events', views.TrackingEventViewSet, basename='trackingevent')

# (Đã XÓA router cho 'transporters' và 'retailers')

urlpatterns = [
    path('', include(router.urls)),
]