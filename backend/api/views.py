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
from rest_framework.viewsets import ViewSet
from datetime import timedelta

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
    serializer_class = UserSerializer  # Use o UserSerializer aqui
    queryset = User.objects.all()

    def list(self, request):
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)  # Serializa os dados dos usuários
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
    queryset = UserAward.objects.all()
    serializer_class = UserAwardSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get("user")

        if user_id:
            return self.queryset.filter(user__id=user_id)
        
        # Se nenhum usuário foi passado, retorna os prêmios do usuário autenticado
        if self.request.user.is_authenticated:
            return self.queryset.filter(user=self.request.user)

        return self.queryset.none()  # Se não houver usuário autenticado, retorna vazio

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]  # Apenas usuários autenticados podem acessar

    def get(self, request):
        user = request.user  # Obtém o usuário logado
        serializer = UserSerializer(user)  # Serializa os dados do usuário
        return Response(serializer.data)  # Retorna os dados serializados
    
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user, is_read=False).order_by('-created_at')

    @action(detail=True, methods=['POST'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "Notificação marcada como lida"}, status=status.HTTP_200_OK)
    
class UserDetailViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]  # Apenas usuários autenticados podem acessar

    def retrieve(self, request, pk=None):
        try:
            user = CustomUser.objects.get(id=pk)  # Busca o usuário pelo ID
            serializer = UserSerializer(user)  # Serializa os dados do usuário
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
class UserMetricsViewSet(ViewSet):
    def retrieve(self, request, pk=None):
        try:
            # Filtra os PIREPs do usuário com status "Approved"
            approved_pireps = PirepsFlight.objects.filter(pilot_id=pk, status="Approved")

            # Filtra os PIREPs aprovados nos últimos 30 dias
            thirty_days_ago = timezone.now() - timedelta(days=30)
            approved_pireps_last_30_days = approved_pireps.filter(registration_date__gte=thirty_days_ago)

            # Calcula as métricas
            total_flights = approved_pireps.count()

            # Soma os tempos de voo em segundos
            total_flight_time_seconds = sum(
                pirep.flight_duration.total_seconds() for pirep in approved_pireps if pirep.flight_duration
            )
            total_flight_time_hours = total_flight_time_seconds / 3600  # Converte para horas

            # Converte horas decimais para HH:MM
            def decimal_to_hh_mm(decimal_hours):
                hours = int(decimal_hours)
                minutes = int((decimal_hours - hours) * 60)
                return f"{hours}:{minutes:02d}"

            total_flight_time_hh_mm = decimal_to_hh_mm(total_flight_time_hours)

            total_flights_last_30_days = approved_pireps_last_30_days.count()

            # Soma os tempos de voo dos últimos 30 dias em segundos
            total_flight_time_last_30_days_seconds = sum(
                pirep.flight_duration.total_seconds() for pirep in approved_pireps_last_30_days if pirep.flight_duration
            )
            total_flight_time_last_30_days_hours = total_flight_time_last_30_days_seconds / 3600  # Converte para horas

            # Converte horas decimais para HH:MM
            total_flight_time_last_30_days_hh_mm = decimal_to_hh_mm(total_flight_time_last_30_days_hours)

            # Calcula as médias
            average_flights_per_day = total_flights_last_30_days / 30 if total_flights_last_30_days > 0 else 0
            average_flight_time_per_day = total_flight_time_last_30_days_hours / 30 if total_flight_time_last_30_days_hours > 0 else 0

            # Retorna as métricas
            metrics = {
                "total_flights": total_flights,
                "total_flight_time": total_flight_time_hh_mm,  # Em formato HH:MM
                "total_flights_last_30_days": total_flights_last_30_days,
                "total_flight_time_last_30_days": total_flight_time_last_30_days_hh_mm,  # Em formato HH:MM
                "average_flights_per_day": average_flights_per_day,
                "average_flight_time_per_day": average_flight_time_per_day,
            }

            return Response(metrics, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class UserApprovedFlightsViewSet(ViewSet):
    def retrieve(self, request, pk=None):
        try:
            # Filtra os voos aprovados do usuário
            approved_flights = PirepsFlight.objects.filter(pilot_id=pk, status="Approved")
            flights_data = []

            for flight in approved_flights:
                flights_data.append({
                    "flight": flight.flight_number,
                    "dep": flight.departure_airport,
                    "arr": flight.arrival_airport,
                    "date": flight.registration_date,
                    "network": flight.network,
                    "duration": flight.flight_duration,
                    "aircraft": flight.aircraft,
                    "status": flight.status,
                })

            return Response(flights_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)