from django.urls import path
from .views import *

urlpatterns = [
    path('', GameList.as_view(), name='game-list'),
    path('rawg/', FetchRAWG.as_view(), name='fetch-rawg-games'),
    path('<int:game_id>/', GameDetail.as_view(), name='game-detail'),
    path('save/<int:game_id>/', SavedGameView.as_view(), name='save-game'),
    path('saved/', SavedGamesList.as_view(), name='saved-games-list'),
]
