# tracking/serializers.py
from rest_framework import serializers
from .models import TrackingEvent, Transporter, Retailer

class TrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = '__all__'
        read_only_fields = ['transaction_id'] # ID này là tự tăng

class TransporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transporter
        fields = '__all__'
        read_only_fields = ['id'] # ID này là tự tăng

class RetailerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retailer
        fields = '__all__'
        read_only_fields = ['id'] # ID này là tự tăng