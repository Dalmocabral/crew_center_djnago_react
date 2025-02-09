from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        # Verificar se o email foi fornecido
        if not email:
            raise ValueError('Email must be provided')
        
        # Criar um novo usuário
        user = self.model(
            email=self.normalize_email(email),            
            **extra_fields
        )

        # Configurar a senha do usuário e salvar no banco de dados
        user.set_password(password)
        user.save(using=self._db)
        return user
       

    def create_superuser(self, email, password, **extra_fields):
        # Configurar as permissões para um superusuário
        extra_fields.setdefault('is_staff', True)        
        extra_fields.setdefault('is_superuser', True)

        # Chamar o método _create_user para criar o superusuário
        return self.create_user(email, password, **extra_fields)



class CustomUser(AbstractUser):
    email = models.EmailField(max_length=200, unique=True)
    first_name = models.CharField(max_length=200, null=True, blank=True)
    last_name = models.CharField(max_length=240, null=True, blank=True)
    usernameIFC = models.CharField(max_length=240, null=True, blank=True)
    country = models.CharField(max_length=240, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remova 'username' dos campos obrigatórios

    def save(self, *args, **kwargs):
        # Gera um username automaticamente se não for fornecido
        if not self.username:
            self.username = self.email  # Usa o email como username
        super().save(*args, **kwargs)
