from django.contrib import admin
from .models import *

class FlightLegInline(admin.TabularInline):
    model = FlightLeg
    extra = 1

class AllowedAircraftInline(admin.TabularInline):
    model = AllowedAircraft
    extra = 1

class AllowedIcaoInline(admin.TabularInline):
    model = AllowedIcao
    extra = 1

@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    inlines = [FlightLegInline, AllowedAircraftInline, AllowedIcaoInline]

@admin.register(UserAward)
class UserAwardAdmin(admin.ModelAdmin):
    list_display = ('user', 'award', 'progress', 'start_date', 'end_date')
    list_filter = ('award', 'progress')
''' 
@admin.register(PilotAward)
class PilotAwardAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')  # Exibe o nome e a descrição na lista de awards
    filter_horizontal = ('participants',)  # Facilita a seleção de participantes existentes

    '''
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'message', 'image', 'created_at')

admin.site.register(CustomUser)
admin.site.register(PirepsFlight)
