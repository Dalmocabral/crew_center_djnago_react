from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *  # Importe a viewset correta

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')  # Registre a viewset
router.register('login', LoginViewset, basename='login')  # Login a viewset
router.register('users', UserViewset, basename='users')  # Users a viewset
router.register('pirepsflight', PirepsFlightViewset)  # Peripsflight a viewset
router.register('myflights', MyFlightsViewSet, basename='myflights')  # Registra no roteador
router.register('dashboard', DashboardViewSet, basename='dashboard')  # Registra no roteador
router.register(r'awards', AwardViewSet)
router.register(r'flight-legs', FlightLegViewSet)
router.register(r'allowed-aircrafts', AllowedAircraftViewSet)
router.register(r'allowed-icaos', AllowedIcaoViewSet)
router.register(r'user-awards', UserAwardViewSet)


urlpatterns = router.urls