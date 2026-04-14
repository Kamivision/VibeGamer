from django.urls import path
from .views import *

urlpatterns = [
    path('<int:profile_id>/', ProfileView.as_view(), name='profile-view'),
]