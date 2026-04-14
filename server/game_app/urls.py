from django.urls import path
from .views import *

urlpatterns = [
    path('', GameList.as_view(), name='game-list'),
    path('<int:game_id>/', GameDetail.as_view(), name='game-detail'),
    path('<int:game_id>/save/', SavedGameView.as_view(), name='save-game'),
    path('saved/', SavedGamesList.as_view(), name='saved-games-list'),
]
