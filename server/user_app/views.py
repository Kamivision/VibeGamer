from django.shortcuts import redirect, render
from django.contrib.auth import login, logout, authenticate
from .models import User
from rest_framework import status as s
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.conf import settings
from django.core import signing
from urllib.parse import urlencode
import requests
import logging
from profile_app.models import Profile

logger = logging.getLogger(__name__)


def steam_auth_disabled_response():
    return Response(
        {'error': 'Steam sign-in is disabled in local development and will be enabled after deployment.'},
        status=s.HTTP_503_SERVICE_UNAVAILABLE,
    )


def github_not_configured_response():
    return Response(
        {'error': 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'},
        status=s.HTTP_503_SERVICE_UNAVAILABLE,
    )


def get_github_email(access_token):
    email_response = requests.get(
        'https://api.github.com/user/emails',
        headers={
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {access_token}',
        },
        timeout=5,
    )
    email_response.raise_for_status()

    email_list = email_response.json()
    if not isinstance(email_list, list):
        return None

    for email_item in email_list:
        if email_item.get('primary') and email_item.get('verified'):
            return email_item.get('email')

    for email_item in email_list:
        if email_item.get('verified'):
            return email_item.get('email')

    return None

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


class SteamLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        if not getattr(settings, 'ENABLE_STEAM_AUTH', False):
            return steam_auth_disabled_response()

        steam_key = getattr(settings, 'STEAM_KEY', None)
        if not steam_key:
            return Response(
                {'error': 'Steam API key is not configured'},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        redirect_uri = request.query_params.get('redirect_uri', 'http://localhost:5173/auth/steam/callback')
        return_to = (
            'http://localhost:8000/api/v1/users/steam/callback/'
            f'?redirect_uri={redirect_uri}'
        )

        openid_params = {
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': return_to,
            'openid.realm': 'http://localhost:8000',
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        }

        steam_openid_url = 'https://steamcommunity.com/openid/login'
        full_url = f"{steam_openid_url}?{urlencode(openid_params)}"
        return Response({'redirect_url': full_url}, status=s.HTTP_200_OK)


class SteamCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        if not getattr(settings, 'ENABLE_STEAM_AUTH', False):
            return steam_auth_disabled_response()

        steam_key = getattr(settings, 'STEAM_KEY', None)
        if not steam_key:
            return Response(
                {'error': 'Steam API key is not configured'},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Copy all openid.* params from the request, then change mode to check_auth
        openid_params = {}
        for key, value in request.query_params.items():
            if key.startswith('openid.'):
                openid_params[key] = value
        
        logger.info(f"Received OpenID params: {openid_params}")
        
        # Change mode to check_auth for verification
        openid_params['openid.mode'] = 'check_auth'

        verify_url = 'https://steamcommunity.com/openid/login'
        try:
            verify_response = requests.post(verify_url, data=openid_params, timeout=5)
            logger.info(f"Steam verification response: {verify_response.text}")
        except requests.RequestException as e:
            logger.error(f"Steam request failed: {str(e)}")
            return Response(
                {'error': 'Failed to verify with Steam', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if 'is_valid:true' not in verify_response.text:
            logger.warning(f"Steam verification failed. Response: {verify_response.text}")
            return Response(
                {'error': 'Steam verification failed'},
                status=s.HTTP_401_UNAUTHORIZED,
            )

        claimed_id = request.query_params.get('openid.claimed_id', '')
        steam_id = claimed_id.split('/')[-1] if claimed_id else None
        if not steam_id:
            return Response(
                {'error': 'Could not extract Steam ID'},
                status=s.HTTP_400_BAD_REQUEST,
            )

        try:
            profile_response = requests.get(
                'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
                params={'key': steam_key, 'steamids': steam_id},
                timeout=5,
            )
            profile_data = profile_response.json()
            players = profile_data.get('response', {}).get('players', [])
            player = players[0] if players else {}
            steam_username = player.get('personaname', f'SteamUser{steam_id}')
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch Steam profile', 'detail': str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    username=f'steam_{steam_id}',
                    defaults={'email': f'steam_{steam_id}@steam.local'},
                )
                if created:
                    Profile.objects.create(user=user)
                token, _ = Token.objects.get_or_create(user=user)
        except Exception as e:
            return Response(
                {'error': 'Failed to create/fetch user', 'detail': str(e)},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        redirect_uri = request.query_params.get('redirect_uri', 'http://localhost:5173')
        redirect_url = f'{redirect_uri}?token={token.key}&steam_username={steam_username}'

        return Response(
            {'redirect_url': redirect_url, 'token': token.key, 'username': user.username},
            status=s.HTTP_200_OK,
        )


class GitHubLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        client_id = getattr(settings, 'GITHUB_CLIENT_ID', None)
        client_secret = getattr(settings, 'GITHUB_CLIENT_SECRET', None)
        if not client_id or not client_secret:
            return github_not_configured_response()

        frontend_redirect_uri = request.query_params.get('redirect_uri', 'http://localhost:5173/auth')
        callback_url = request.build_absolute_uri('/api/v1/users/github/callback/')

        state_value = signing.dumps({'redirect_uri': frontend_redirect_uri})
        github_params = {
            'client_id': client_id,
            'redirect_uri': callback_url,
            'scope': 'read:user user:email',
            'state': state_value,
        }
        redirect_url = f"https://github.com/login/oauth/authorize?{urlencode(github_params)}"
        return Response({'redirect_url': redirect_url}, status=s.HTTP_200_OK)


class GitHubCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        client_id = getattr(settings, 'GITHUB_CLIENT_ID', None)
        client_secret = getattr(settings, 'GITHUB_CLIENT_SECRET', None)
        if not client_id or not client_secret:
            return github_not_configured_response()

        code = request.query_params.get('code')
        state_value = request.query_params.get('state')
        if not code or not state_value:
            return Response(
                {'error': 'GitHub callback is missing code or state.'},
                status=s.HTTP_400_BAD_REQUEST,
            )

        try:
            state_data = signing.loads(state_value, max_age=600)
            frontend_redirect_uri = state_data.get('redirect_uri', 'http://localhost:5173/auth')
        except signing.BadSignature:
            return Response(
                {'error': 'GitHub state is invalid or expired.'},
                status=s.HTTP_400_BAD_REQUEST,
            )

        callback_url = request.build_absolute_uri('/api/v1/users/github/callback/')

        try:
            token_response = requests.post(
                'https://github.com/login/oauth/access_token',
                headers={'Accept': 'application/json'},
                data={
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'code': code,
                    'redirect_uri': callback_url,
                    'state': state_value,
                },
                timeout=5,
            )
            token_response.raise_for_status()
            token_data = token_response.json()
        except requests.RequestException as error:
            return Response(
                {'error': 'Failed to exchange GitHub code for a token.', 'detail': str(error)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        access_token = token_data.get('access_token')
        if not access_token:
            return Response(
                {'error': 'GitHub did not return an access token.', 'detail': token_data},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        try:
            github_user_response = requests.get(
                'https://api.github.com/user',
                headers={
                    'Accept': 'application/vnd.github+json',
                    'Authorization': f'Bearer {access_token}',
                },
                timeout=5,
            )
            github_user_response.raise_for_status()
            github_user = github_user_response.json()
        except requests.RequestException as error:
            return Response(
                {'error': 'Failed to fetch the GitHub user profile.', 'detail': str(error)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        github_id = github_user.get('id')
        github_login = github_user.get('login', 'github-user')
        github_email = github_user.get('email')
        if not github_email:
            try:
                github_email = get_github_email(access_token)
            except requests.RequestException:
                github_email = None

        if not github_id:
            return Response(
                {'error': 'GitHub user data is missing an id.'},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        if not github_email:
            github_email = f'github_{github_id}@users.noreply.local'

        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    username=f'github_{github_id}',
                    defaults={
                        'email': github_email,
                    },
                )
                if created:
                    Profile.objects.create(user=user)
                elif not user.email:
                    user.email = github_email
                    user.save(update_fields=['email'])

                token, _ = Token.objects.get_or_create(user=user)
        except Exception as error:
            return Response(
                {'error': 'Failed to create or load the local user.', 'detail': str(error)},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        redirect_params = urlencode(
            {
                'token': token.key,
                'username': github_login,
                'email': github_email,
            }
        )
        return redirect(f'{frontend_redirect_uri}?{redirect_params}')
