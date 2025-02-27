from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'usernameIFC', 'country', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Remove o campo confirm_password
        # Define o username como o email
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
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

        # Retorne os dados validados
        return data
    

class PirepsFlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = PirepsFlight
        fields = ('id', 'flight_icao', 'flight_number', 'departure_airport', 'arrival_airport', 
                  'aircraft', 'flight_duration', 'network', 'registration_date', 'status', 'observation')
        read_only_fields = ('pilot',)  # Impede alteração do piloto


class AwardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        fields = '__all__'

class FlightLegSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightLeg
        fields = '__all__'

class AllowedAircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowedAircraft
        fields = '__all__'

class AllowedIcaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowedIcao
        fields = '__all__'

class UserAwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAward
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']  # Campos que você quer retornar


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'