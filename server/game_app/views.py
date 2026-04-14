from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import Game, SavedGame
from .serializers import GameSerializer, SavedGameSerializer
from user_app.views import UserView

# Create your views here.
class GameList(APIView):
    def get(self, request):
        games = Game.objects.all()
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GameSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=s.HTTP_201_CREATED)
        return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)

class GameDetail(APIView):
    def get(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    def put(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        serializer = GameSerializer(game, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        game.delete()
        return Response(status=s.HTTP_204_NO_CONTENT)

class SavedGameView(UserView):
    def get(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        saved = SavedGame.objects.filter(user=request.user, game=game).exists()
        return Response({"saved": saved})
    
    def post(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        saved_game = SavedGame.objects.create(user=request.user, game=game)
        return Response({"message": f"{game.title} has been saved for {request.user.username}"}, status=s.HTTP_201_CREATED)

    def delete(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        saved_game = get_object_or_404(SavedGame, user=request.user, game=game)
        saved_game.delete()
        return Response({"message": f"{game.title} has been removed from {request.user.username}'s saved games"}, status=s.HTTP_204_NO_CONTENT)
    
class SavedGamesList(UserView):
    def get(self, request):
        saved_games = SavedGame.objects.filter(user=request.user)
        serializer = SavedGameSerializer(saved_games, many=True)
        return Response(serializer.data)