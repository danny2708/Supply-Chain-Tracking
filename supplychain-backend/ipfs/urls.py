from django.urls import path
from .views import PinataUploadView, PinataUploadJSONView

# Trong ipfs/urls.py
urlpatterns = [
    path("upload/", PinataUploadView.as_view(), name="pinata-upload"),
    path("upload-json/", PinataUploadJSONView.as_view(), name="pinata-upload-json"),
]