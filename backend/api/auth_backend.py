from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets
from rest_framework.response import Response
from knox.models import AuthToken
from django.contrib.auth import authenticate

User = get_user_model()

class EmailAuthBackend:
    def authenticate(self, request, email=None, password=None):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

class LoginSerializer(serializers.Serializer):  # Use Serializer em vez de ModelSerializer
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Email and password are required")

        return data

class LoginViewSet(viewsets.ViewSet):
    permission_classes = []
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            _, token = AuthToken.objects.create(user)

            return Response(
                {
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'token': token
                }
            )
        else:
            return Response(serializer.errors, status=400)

# No seu arquivo de rotas (urls.py), registre o LoginViewSet:
# router.register('login', LoginViewSet, basename='login')