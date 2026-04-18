from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import Game, SavedGame
from .serializers import GameSerializer, SavedGameSerializer
from user_app.views import UserView
import requests

# Helper function to normalize RAWG API results
def normalize_game_results(raw_results):
    """
    Transform raw RAWG API game objects into a consistent normalized shape.
    
    Args:
        raw_results: List of game dicts from RAWG API response.
    
    Returns:
        List of normalized game dicts with id, name, released, rating, etc.
    """
    return [
        {
            "id": game.get("id"),
            "name": game.get("name"),
            "released": game.get("released"),
            "rating": game.get("rating"),
            "background_image": game.get("background_image"),
            "genres": [
                genre.get("name")
                for genre in (game.get("genres") or [])
                if isinstance(genre, dict) and genre.get("name")
            ],
            "platforms": [
                platform_item.get("platform", {}).get("name")
                for platform_item in (game.get("platforms") or [])
                if isinstance(platform_item, dict)
                and isinstance(platform_item.get("platform"), dict)
                and platform_item.get("platform", {}).get("name")
            ],
        }
        for game in raw_results
    ]

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
    
# RAWG API integration
    
class FetchRAWG(APIView):
    def get(self, request):
        api_key = getattr(settings, "RAWG_KEY", None)
        if not api_key:
            return Response(
                {"error": "RAWG API key is not configured"},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        rawg_url = "https://api.rawg.io/api/games"

        # Pass through client filters (search, page, genres, platforms, ordering, etc.)
        params = request.query_params.copy()
        params["key"] = api_key

        try:
            rawg_response = requests.get(rawg_url, params=params, timeout=10)
        except requests.RequestException:
            return Response(
                {"error": "Unable to reach RAWG API"},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if rawg_response.status_code != 200:
            return Response(
                {
                    "error": "RAWG API returned an error",
                    "rawg_status": rawg_response.status_code,
                },
                status=s.HTTP_502_BAD_GATEWAY,
            )

        data = rawg_response.json()
        results = data.get("results", [])

        normalized_results = normalize_game_results(results)

        return Response(
            {
                "count": data.get("count", 0),
                "next": data.get("next"),
                "previous": data.get("previous"),
                "results": normalized_results,
            },
            status=s.HTTP_200_OK,
        )
class FetchRecommendations(UserView):
    def get(self, request):
        api_key = getattr(settings, "RAWG_KEY", None)
        if not api_key:
            return Response(
                {"error": "RAWG API key is not configured"},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        user_profile = getattr(request.user, "profile", None)
        if not user_profile:
            return Response(
                {"error": "User profile not found"},
                status=s.HTTP_404_NOT_FOUND,
            )

        # Build RAWG params from profile
        params = {"key": api_key}
        personality_tags = user_profile.personality_tags or []
        
        # Map internal personality_tags to RAWG's "tags" parameter
        if personality_tags and isinstance(personality_tags, list):
            params["tags"] = ",".join(personality_tags)
        else:
            # Fallback: if no tags, request popular/recent games
            params["ordering"] = "-rating"
            params["page_size"] = 12

        rawg_url = "https://api.rawg.io/api/games"
        
        try:
            rawg_response = requests.get(rawg_url, params=params, timeout=10)
        except requests.RequestException:
            return Response(
                {"error": "Unable to reach RAWG API"},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if rawg_response.status_code != 200:
            return Response(
                {
                    "error": "RAWG API returned an error",
                    "rawg_status": rawg_response.status_code,
                },
                status=s.HTTP_502_BAD_GATEWAY,
            )

        data = rawg_response.json()
        results = data.get("results", [])
        normalized_results = normalize_game_results(results)

        return Response(
            {
                "count": data.get("count", 0),
                "next": data.get("next"),
                "previous": data.get("previous"),
                "results": normalized_results,
            },
            status=s.HTTP_200_OK,
        )

    
    