from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth import get_user_model
from api.choice import CHOICE_AIRCRAFT
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is a required field')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True )
        extra_fields.setdefault('is_superuser', True )
        return self.create_user(email, password, **extra_fields)




class CustomUser(AbstractUser):
    email = models.EmailField(max_length=200, unique=True)
    first_name = models.CharField(max_length=200, blank=True)
    last_name = models.CharField(max_length=200, blank=True)
    usernameIFC = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=200, blank=True)
    username = models.CharField(max_length=200, null=True, blank=True)

    objects = CustomUserManager()


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []



User = get_user_model()

class Award(models.Model):
    CHOICE_TYPE = [
        ('Tour', 'Tour'),  # Tupla (valor para o banco, valor legível)
    ]

    link_image = models.URLField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    type = models.CharField(max_length=5, choices=CHOICE_TYPE, default='Tour')  # Referência às escolhas
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class FlightLeg(models.Model):
    award = models.ForeignKey(Award, related_name='flight_legs', on_delete=models.CASCADE)
    from_airport = models.CharField(max_length=4)
    to_airport = models.CharField(max_length=4)

    def save(self, *args, **kwargs):
        self.from_airport = self.from_airport.upper()
        self.to_airport = self.to_airport.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.from_airport} to {self.to_airport}"

class AllowedAircraft(models.Model):
    award = models.ForeignKey(Award, related_name='allowed_aircrafts', on_delete=models.CASCADE)
    aircraft = models.CharField(max_length=5, choices=CHOICE_AIRCRAFT)

    def __str__(self):
        return self.aircraft

class AllowedIcao(models.Model):
    award = models.ForeignKey(Award, related_name='allowed_icao', on_delete=models.CASCADE)
    company_icao = models.CharField(max_length=5)

    def __str__(self):
        return self.company_icao

class UserAward(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    award = models.ForeignKey(Award, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'award')

    def __str__(self):
        return f"{self.user.email} - {self.award.name}"

    def check_award_completion(self, user_flights):
        completed_flights = 0
        total_flights = self.award.flight_legs.count()

        # Coletar ICAOs permitidos e aeronaves permitidas
        allowed_icaos = [icao.company_icao.upper() for icao in self.award.allowed_icao.all()]
        allowed_aircrafts = [aircraft.aircraft for aircraft in self.award.allowed_aircrafts.all()]

        print(f"ICAOs permitidos: {allowed_icaos}")
        print(f"Aeronaves permitidas: {allowed_aircrafts}")

        for required_flight in self.award.flight_legs.all():
            for user_flight in user_flights:
                print(f"Verificando voo do usuário: {user_flight.flight_icao} ({user_flight.departure_airport} -> {user_flight.arrival_airport})")

                # Verificar se os aeroportos batem
                if required_flight.from_airport == user_flight.departure_airport and required_flight.to_airport == user_flight.arrival_airport:
                    print(f"Voo entre aeroportos corretos: {required_flight.from_airport} -> {required_flight.to_airport}")
                    
                    # Verificar se precisa checar ICAO (caso haja ICAOs definidos)
                    icao_check = not allowed_icaos or user_flight.flight_icao.upper() in allowed_icaos
                    if not allowed_icaos:
                        print("Nenhum ICAO exigido para este prêmio, ignorando verificação de ICAO.")
                    elif icao_check:
                        print(f"ICAO {user_flight.flight_icao} corresponde a um ICAO permitido.")

                    # Verificar se precisa checar aeronaves (caso haja aeronaves definidas)
                    aircraft_check = not allowed_aircrafts or user_flight.aircraft in allowed_aircrafts
                    if not allowed_aircrafts:
                        print("Nenhuma aeronave exigida para este prêmio, ignorando verificação de aeronaves.")
                    elif aircraft_check:
                        print(f"Aeronave {user_flight.aircraft} corresponde a uma aeronave permitida.")

                    # Checar se todos os critérios (quando aplicáveis) estão corretos
                    if icao_check and aircraft_check:
                        print(f"Voo {user_flight.flight_icao} corresponde a todos os critérios.")
                        completed_flights += 1
                        break  # Para de verificar outros voos, pois este já completou o trecho
                    else:
                        print(f"Voo {user_flight.flight_icao} não corresponde a todos os critérios.")
        
        # Calcular progresso
        if total_flights > 0:
            progress = (completed_flights / total_flights) * 100
        else:
            progress = 0

        print(f"Progresso final: {progress}%")
        
        self.progress = progress
        if progress == 100 and not self.end_date:
            self.end_date = timezone.now()
        self.save()


    def start_award(self):
        if not self.start_date:
            self.start_date = timezone.now()
            self.save()


    class PilotAward(models.Model):
        image_url = models.URLField(max_length=300, null=True, blank=True)  # Link da imagem do award
        name = models.CharField(max_length=100)  # Nome do award
        description = models.TextField()  # Descrição do award
        participants = models.ManyToManyField(User, related_name='pilot_awards', blank=True)  # Usuários participantes
        
        def __str__(self):
            return self.name
        


class PirepsFlight (models.Model):
    STATUS_CHOICES = [
        ('In Review', 'In Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
   


    aircraft_choices = CHOICE_AIRCRAFT
    flight_icao =  models.CharField(max_length=10, null=True)
    flight_number = models.CharField(max_length=10)
    departure_airport = models.CharField(max_length=50)
    arrival_airport = models.CharField(max_length=50)    
    aircraft = models.CharField(choices=aircraft_choices, default=aircraft_choices[0][0], max_length=50)
    pilot = models.ForeignKey(User, on_delete=models.CASCADE)
    flight_duration = models.DurationField(null=True, blank=True)     
    registration_date = models.DateTimeField(default=timezone.now)
    network = models.CharField(max_length=200, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Em análise')
    observation = models.TextField(max_length=500, null=True, blank=True)  # Permite valores nulos e campos em branco
    # Outros campos relevantes sobre o voo

    def __str__(self):
        return f"{self.flight_number} - {self.pilot.first_name}"