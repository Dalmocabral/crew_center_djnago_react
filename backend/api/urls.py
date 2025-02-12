from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *  # Importe a viewset correta

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')  # Registre a viewset

urlpatterns = router.urls