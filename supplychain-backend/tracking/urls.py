# tracking/urls.py (TỆP MỚI)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Đăng ký 3 bộ API
router.register(r'tracking-events', views.TrackingEventViewSet, basename='trackingevent')
router.register(r'transporters', views.TransporterViewSet, basename='transporter')
router.register(r'retailers', views.RetailerViewSet, basename='retailer')

urlpatterns = [
    path('', include(router.urls)),
]