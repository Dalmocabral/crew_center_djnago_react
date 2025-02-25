from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PirepsFlight, UserAward

@receiver(post_save, sender=PirepsFlight)
def update_user_award_on_pirep_approval(sender, instance, **kwargs):
    """
    Signal para atualizar o progresso do UserAward quando um PirepsFlight é aprovado.
    """
    # Verifica se o status do PirepsFlight foi alterado para "Approved"
    if instance.status == 'Approved':
        # Obtém o usuário associado ao PirepsFlight
        user = instance.pilot

        # Obtém todos os UserAwards associados ao usuário
        user_awards = UserAward.objects.filter(user=user)

        # Para cada UserAward, verifica se o voo aprovado contribui para o progresso
        for user_award in user_awards:
            # Obtém todos os voos do usuário
            user_flights = PirepsFlight.objects.filter(pilot=user, status='Approved')

            # Atualiza o progresso do UserAward
            user_award.check_award_completion(user_flights)