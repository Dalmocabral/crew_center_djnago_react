from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewSet, LoginViewSet  # Importe a viewset correta

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')  # Registre a viewset
router.register('login', LoginViewSet, basename='login')  # Login a viewset
urlpatterns = router.urls