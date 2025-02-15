from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .serializers import *
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken

User = get_user_model()

class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]  # Permite acesso sem autenticação
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Salva o usuário
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(request, email=email, password=password)

            if user:
                _, token = AuthToken.objects.create(user)

                return Response(
                    {
                        'user': self.serializer_class(user).data,
                        'token': token
                    }
                )
            else:
                return Response({'error': 'Invalid credentia'}, status=401)
        
        else:
            return Response(serializer.errors, status=400)
        

class UserViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]  # Permite acesso sem autenticação
    serializer_class = RegisterSerializer
    queryset = User.objects.all()

    def list(self, request):

        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True) 

        return Response(serializer.data)
    


class PirepsFlightViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = PirepsFlightSerializer
    queryset = PirepsFlight.objects.all()

    def list(self, request):

        queryset = PirepsFlight.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

        