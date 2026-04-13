from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'personality', 'quiz_results', 'play_time_preference', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']