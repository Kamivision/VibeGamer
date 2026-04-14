from rest_framework.serializers import ModelSerializer
from .models import Game, SavedGame

class GameSerializer(ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class SavedGameSerializer(ModelSerializer):
    class Meta:
        model = SavedGame
        fields = '__all__'