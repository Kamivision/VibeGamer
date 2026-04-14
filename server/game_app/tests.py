from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from user_app.models import User
from game_app.models import Game, SavedGame


class SavedGameTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="saved@example.com",
            username="saveduser",
            password="password123",
        )
        self.token = Token.objects.create(user=self.user)

        self.game = Game.objects.create(
            source="rawg",
            external_id="3498",
            slug="grand-theft-auto-v",
            title="Grand Theft Auto V",
            description="Open-world action game",
            genre="Action",
            tags=["open-world", "action"],
            playtime=35,
            image_url="https://example.com/game.jpg",
            metadata={"rating": 4.5},
        )

        self.saved_list_url = "/api/v1/games/saved/"
        self.save_url = f"/api/v1/games/save/{self.game.id}/"

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_saved_games_list_requires_auth(self):
        response = self.client.get(self.saved_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_saved_games_returns_current_users_saved_games(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.get(self.saved_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user"], self.user.id)
        self.assertEqual(response.data[0]["game"], self.game.id)

    def test_post_save_creates_saved_game(self):
        self.authenticate()
        response = self.client.post(self.save_url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            SavedGame.objects.filter(user=self.user, game=self.game).exists()
        )

    def test_delete_save_removes_saved_game(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.delete(self.save_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            SavedGame.objects.filter(user=self.user, game=self.game).exists()
        )
