from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from .serializers import *
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from django.db.models import Sum, Count
from rest_framework.decorators import action

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
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PirepsFlightSerializer
    queryset = PirepsFlight.objects.all()

    def perform_create(self, serializer):
        serializer.save(pilot=self.request.user, status="In Review")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pilot != request.user:
            raise PermissionDenied("Você não tem permissão para editar este PIREP.")
        if instance.status != "In Review":
            return Response(
                {"detail": "Este PIREP não pode ser editado porque não está em análise."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pilot != request.user:
            raise PermissionDenied("Você não tem permissão para excluir este PIREP.")
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class MyFlightsViewSet(viewsets.ReadOnlyModelViewSet):  
    """ViewSet para listar os voos do usuário logado."""
    serializer_class = PirepsFlightSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        queryset = PirepsFlight.objects.filter(pilot=request.user)
        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)
    
class DashboardViewSet(viewsets.ViewSet):
    
    serializer_class = PirepsFlightSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        # Dados do usuário logado
        user_flights = PirepsFlight.objects.filter(pilot=request.user)
        serializer = self.serializer_class(user_flights, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def rankings(self, request):
        
        # Top 5 Duração de Voo
        top_duration = (
            PirepsFlight.objects.filter(status="Approved")
            .values("pilot__first_name", "pilot__last_name")  # Use o campo correto para o nome do piloto
            .annotate(total_duration=Sum("flight_duration"))
            .order_by("-total_duration")[:5]
        )

        # Top 5 Total de Voos
        top_flights = (
            PirepsFlight.objects.filter(status="Approved")
            .values("pilot__first_name", "pilot__last_name")  # Use o campo correto para o nome do piloto
            .annotate(total_flights=Count("id"))
            .order_by("-total_flights")[:5]
        )

        return Response({
            "top_duration": list(top_duration),
            "top_flights": list(top_flights),
        })
    
class AwardViewSet(viewsets.ModelViewSet):
    queryset = Award.objects.all()
    serializer_class = AwardsSerializer
    permission_classes = [permissions.AllowAny]  # Ou outra permissão, se necessário

class FlightLegViewSet(viewsets.ModelViewSet):
    serializer_class = FlightLegSerializer
    permission_classes = [permissions.IsAuthenticated]  # Apenas usuários autenticados
    queryset = FlightLeg.objects.all()  # Define o queryset padrão

    def get_queryset(self):
        # Filtra as FlightLeg com base no award_id
        queryset = super().get_queryset()  # Usa o queryset padrão
        award_id = self.request.query_params.get('award', None)
        if award_id:
            queryset = queryset.filter(award_id=award_id)
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        for leg_data in response.data:
            # Busca o PIREP associado à leg para o usuário logado
            pirep = PirepsFlight.objects.filter(
                departure_airport=leg_data['from_airport'],
                arrival_airport=leg_data['to_airport'],
                pilot=request.user  # Filtra PIREPs do usuário logado (usando o campo correto)
            ).first()
            # Adiciona o status do PIREP à resposta
            leg_data['pirep_status'] = pirep.status if pirep else None
        return response

class AllowedAircraftViewSet(viewsets.ModelViewSet):
    queryset = AllowedAircraft.objects.all()
    serializer_class = AllowedAircraftSerializer
    permission_classes = [permissions.AllowAny]

class AllowedIcaoViewSet(viewsets.ModelViewSet):
    queryset = AllowedIcao.objects.all()
    serializer_class = AllowedIcaoSerializer
    permission_classes = [permissions.AllowAny]

class UserAwardViewSet(viewsets.ModelViewSet):
    serializer_class = UserAwardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserAward.objects.none()  # Define um queryset padrão

    def get_queryset(self):
        # Retorna apenas os UserAward do usuário logado, incluindo os dados do Award
        return UserAward.objects.filter(user=self.request.user).select_related('award')

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]  # Apenas usuários autenticados podem acessar

    def get(self, request):
        user = request.user  # Obtém o usuário logado
        serializer = UserSerializer(user)  # Serializa os dados do usuário
        return Response(serializer.data)  # Retorna os dados serializados