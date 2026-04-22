from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import Game, SavedGame
from .serializers import GameSerializer, SavedGameSerializer
from user_app.views import UserView
import requests


PLATFORM_SLUG_MAP = {
    "PC": "pc",
    "macOS": "macos",
    "Linux": "linux",
    "PlayStation 5": "playstation5",
    "PlayStation 4": "playstation4",
    "Xbox Series X/S": "xbox-series-x",
    "Xbox One": "xbox-one",
    "Nintendo Switch": "nintendo-switch",
    "iOS": "ios",
    "Android": "android",
}

GENRE_SLUG_MAP = {
    "RPG": "role-playing-games-rpg",
    "Massively Multiplayer": "massively-multiplayer",
}


def slugify_label(value):
    if not isinstance(value, str):
        return ""

    slug = value.strip().lower()
    slug = slug.replace("&", "and")
    slug = slug.replace("/", "-")
    slug = "-".join(part for part in slug.split())
    return slug


PLATFORM_SLUG_ALIASES = {
    slugify_label(label): slug
    for label, slug in PLATFORM_SLUG_MAP.items()
}

GENRE_SLUG_ALIASES = {
    slugify_label(label): slug
    for label, slug in GENRE_SLUG_MAP.items()
}


def resolve_mapped_slug(label, explicit_map, alias_map):
    """Resolve a user-facing label into a RAWG slug with alias fallback."""
    if not isinstance(label, str):
        return ""

    direct_match = explicit_map.get(label)
    if direct_match:
        return direct_match

    normalized = slugify_label(label)
    if not normalized:
        return ""

    return alias_map.get(normalized, normalized)


def merge_unique_games(primary_results, secondary_results):
    """Preserve order while de-duplicating games by id/slug/name."""
    merged = []
    seen_keys = set()

    for game in (primary_results or []) + (secondary_results or []):
        if not isinstance(game, dict):
            continue

        game_key = game.get("id") or game.get("slug") or game.get("name")
        if not game_key or game_key in seen_keys:
            continue

        seen_keys.add(game_key)
        merged.append(game)

    return merged

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
        data = request.data
        playtime = data.get("playtime")
        if playtime is None or playtime == "null":
            playtime = 0

        game, created = Game.objects.get_or_create(
            source=data.get("source", "rawg"),
            external_id=data.get("external_id", ""),
            defaults={
                "slug": data.get("slug", ""),
                "title": data.get("title", ""),
                "description": data.get("description", ""),
                "genre": data.get("genre", ""),
                "tags": data.get("tags", []),
                "playtime": playtime,
                "image_url": data.get("image_url", ""),
                "released_at": data.get("released_at"),
                "metadata": data.get("metadata", {}),
            },
        )
        serializer = GameSerializer(game)
        status_code = s.HTTP_201_CREATED if created else s.HTTP_200_OK
        return Response(serializer.data, status=status_code)

class SavedGameView(UserView):
    def get(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        saved = SavedGame.objects.filter(user=request.user, game=game).exists()
        return Response({"saved": saved})
    
    def post(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        saved_game, created = SavedGame.objects.get_or_create(user=request.user, game=game)
        if created:
            return Response(
                {"message": f"{game.title} has been saved for {request.user.username}"},
                status=s.HTTP_201_CREATED,
            )

        return Response(
            {"message": f"{game.title} is already saved for {request.user.username}"},
            status=s.HTTP_200_OK,
        )

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


class FetchRAWGDetail(APIView):
    def get(self, request, game_id):
        api_key = getattr(settings, "RAWG_KEY", None)
        if not api_key:
            return Response(
                {"error": "RAWG API key is not configured"},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        rawg_url = f"https://api.rawg.io/api/games/{game_id}"
        params = {"key": api_key}

        try:
            rawg_response = requests.get(rawg_url, params=params, timeout=10)
        except requests.RequestException:
            return Response(
                {"error": "Unable to reach RAWG API"},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if rawg_response.status_code == 404:
            return Response(
                {"error": "Game not found"},
                status=s.HTTP_404_NOT_FOUND,
            )

        if rawg_response.status_code != 200:
            return Response(
                {
                    "error": "RAWG API returned an error",
                    "rawg_status": rawg_response.status_code,
                },
                status=s.HTTP_502_BAD_GATEWAY,
            )

        return Response(rawg_response.json(), status=s.HTTP_200_OK)

def create_rec_profile(user_profile):
    """
    Create a profile dict for recommendations based on the user's profile data.
    This can be used to build query parameters for the RAWG API or for internal recommendation logic.
    """
    if not user_profile:
        return {}

    quiz_results = user_profile.quiz_results or {}
    scores = quiz_results.get("scores", {}) if isinstance(quiz_results, dict) else {}
    intent_scores = scores.get("normalizedScores", {}) if isinstance(scores, dict) else {}

    top_intents = []
    if isinstance(intent_scores, dict):
        sorted_scores = sorted(intent_scores.items(), key=lambda item: item[1], reverse=True)
        for intent, score in sorted_scores[:3]:
            top_intents.append({"intent": intent, "score": score})

    profile_data = {
        "hard_filters": { 
            "genre_tags": user_profile.genre_tags or [], 
            "platform_tags": user_profile.platform_tags or [], 
            "excluded_tags": user_profile.excluded_tags or [], 
            "ordering": "-rating" },
        "soft_preferences": { 
            "tags": user_profile.personality_tags or [], 
            "top_intents": top_intents,
            "intent_scores": intent_scores
            }
    }
    return profile_data


def apply_excluded_tags(raw_results, excluded_tags):
    if not isinstance(excluded_tags, list) or len(excluded_tags) == 0:
        return raw_results

    excluded_slugs = set()
    for tag in excluded_tags:
        slug = slugify_label(tag)
        if slug:
            excluded_slugs.add(slug)

    if len(excluded_slugs) == 0:
        return raw_results

    filtered = []
    for game in raw_results:
        game_labels = set()

        genres = game.get("genres") or []
        for genre in genres:
            if isinstance(genre, dict):
                name = genre.get("name")
                slug = slugify_label(name)
                if slug:
                    game_labels.add(slug)

        tags = game.get("tags") or []
        for tag in tags:
            if isinstance(tag, dict):
                name = tag.get("name")
                slug = slugify_label(name)
                if slug:
                    game_labels.add(slug)

        if excluded_slugs.isdisjoint(game_labels):
            filtered.append(game)

    return filtered

class FetchRecommendations(UserView):
    def get(self, request):
        min_strict_results = 8
        min_final_results = 8

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

        rec_profile = create_rec_profile(user_profile)
        hard_filters = rec_profile.get("hard_filters", {})
        soft_preferences = rec_profile.get("soft_preferences", {})

        base_params = {
            "key": api_key,
            "page_size": 12,
            "ordering": hard_filters.get("ordering", "-rating"),
        }

        raw_genres = hard_filters.get("genre_tags", [])
        genre_slugs = []
        if isinstance(raw_genres, list):
            for genre in raw_genres:
                slug = resolve_mapped_slug(genre, GENRE_SLUG_MAP, GENRE_SLUG_ALIASES)
                if slug:
                    genre_slugs.append(slug)
        if genre_slugs:
            base_params["genres"] = ",".join(genre_slugs)

        raw_platforms = hard_filters.get("platform_tags", [])
        platform_slugs = []
        if isinstance(raw_platforms, list):
            for platform in raw_platforms:
                mapped = resolve_mapped_slug(platform, PLATFORM_SLUG_MAP, PLATFORM_SLUG_ALIASES)
                if mapped:
                    platform_slugs.append(mapped)
        if platform_slugs:
            base_params["platforms"] = ",".join(platform_slugs)

        raw_tags = soft_preferences.get("tags", [])
        tag_slugs = []
        if isinstance(raw_tags, list):
            for tag in raw_tags:
                slug = slugify_label(tag)
                if slug:
                    tag_slugs.append(slug)
        strict_params = base_params.copy()
        if tag_slugs:
            strict_params["tags"] = ",".join(tag_slugs)

        relaxed_params = base_params.copy()
        broad_params = {
            "key": api_key,
            "page_size": 24,
            "ordering": hard_filters.get("ordering", "-rating"),
        }

        rawg_url = "https://api.rawg.io/api/games"

        strict_data = None
        relaxed_data = None
        broad_data = None

        debug = {
            "strict_raw_count": 0,
            "relaxed_raw_count": 0,
            "broad_raw_count": 0,
            "chosen_pre_exclusion_count": 0,
            "after_exclusion_count": 0,
            "after_minimum_guard_count": 0,
            "returned_count": 0,
            "minimum_target": min_final_results,
        }

        # Pass A: strict query uses soft tag preferences.
        if "tags" in strict_params:
            try:
                strict_response = requests.get(rawg_url, params=strict_params, timeout=10)
                if strict_response.status_code == 200:
                    strict_data = strict_response.json()
                    debug["strict_raw_count"] = len(strict_data.get("results", []))
            except requests.RequestException:
                strict_data = None

        # Pass B: relaxed query drops soft tags and keeps hard filters.
        try:
            relaxed_response = requests.get(rawg_url, params=relaxed_params, timeout=10)
        except requests.RequestException:
            return Response(
                {"error": "Unable to reach RAWG API"},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if relaxed_response.status_code != 200:
            return Response(
                {
                    "error": "RAWG API returned an error",
                    "rawg_status": relaxed_response.status_code,
                },
                status=s.HTTP_502_BAD_GATEWAY,
            )

        relaxed_data = relaxed_response.json()
        debug["relaxed_raw_count"] = len(relaxed_data.get("results", []))

        chosen_data = relaxed_data
        strategy = "relaxed"
        if strict_data:
            strict_results = strict_data.get("results", [])
            if len(strict_results) >= min_strict_results:
                chosen_data = strict_data
                strategy = "strict"

        results = chosen_data.get("results", [])
        debug["chosen_pre_exclusion_count"] = len(results)

        excluded_tags = hard_filters.get("excluded_tags", [])
        filtered_results = apply_excluded_tags(results, excluded_tags)
        debug["after_exclusion_count"] = len(filtered_results)

        # Pass C: broad fallback to refill recommendations after exclusions.
        if len(filtered_results) < min_final_results:
            try:
                broad_response = requests.get(rawg_url, params=broad_params, timeout=10)
                if broad_response.status_code == 200:
                    broad_data = broad_response.json()
                    broad_results = broad_data.get("results", [])
                    debug["broad_raw_count"] = len(broad_results)

                    merged_results = merge_unique_games(results, broad_results)
                    filtered_results = apply_excluded_tags(merged_results, excluded_tags)

                    if broad_results:
                        strategy = f"{strategy}+broad-fallback"
            except requests.RequestException:
                broad_data = None

        debug["after_minimum_guard_count"] = len(filtered_results)

        final_results = filtered_results[:12]
        normalized_results = normalize_game_results(final_results)
        debug["returned_count"] = len(normalized_results)

        next_url = chosen_data.get("next")
        previous_url = chosen_data.get("previous")
        if broad_data:
            next_url = broad_data.get("next")
            previous_url = broad_data.get("previous")

        return Response(
            {
                "count": len(normalized_results),
                "next": next_url,
                "previous": previous_url,
                "results": normalized_results,
                "strategy": strategy,
                "debug": debug,
            },
            status=s.HTTP_200_OK,
        )

    
    