# tracking/views.py
from rest_framework import viewsets
from .models import TrackingEvent, Transporter, Retailer
from .serializers import (
    TrackingEventSerializer, 
    TransporterSerializer, 
    RetailerSerializer
)

class TrackingEventViewSet(viewsets.ModelViewSet):
    queryset = TrackingEvent.objects.all()
    serializer_class = TrackingEventSerializer

class TransporterViewSet(viewsets.ModelViewSet):
    queryset = Transporter.objects.all()
    serializer_class = TransporterSerializer

class RetailerViewSet(viewsets.ModelViewSet):
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer