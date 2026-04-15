from django.shortcuts import render
from django.contrib.auth import login, logout, authenticate
from .models import User
from rest_framework import status as s
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from profile_app.models import Profile

# Create your views here.

class CreateUserView(APIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            with transaction.atomic():
                new_user = User.objects.create_user(email=email, username=username, password=password)
                new_user.full_clean()
                new_user.save()

                token = Token.objects.create(user=new_user)
                Profile.objects.create(user=new_user)

            return Response({"token":token.key, "email":new_user.email, "username":new_user.username}, status=s.HTTP_201_CREATED)
        except Exception as e:
            return Response(e.args, status=s.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data
        data['username'] = request.data.get('email')
        user = authenticate(username=data.get('username'), password=data.get("password"))
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token":token.key, "email":user.email, "username":user.username})
        else:
            return Response("No user matching credentials", status=s.HTTP_404_NOT_FOUND)

class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class InfoView(UserView):
    def get(self, request):
        user = request.user
        return Response({"token":user.auth_token.key, "email":user.email, "username":user.username})

class LogOutView(UserView):
    def post(self, request):
        user = request.user
        user.auth_token.delete()
        return Response(f"{user.email} has been logged out")
