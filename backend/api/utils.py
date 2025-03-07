from django.core.mail import send_mail

def send_welcome_email(user_email):
    subject = "Welcome to Our Platform!"
    message = "Thank you for signing up. We hope you enjoy our service!"
    from_email = "sysinfiniteworldtour@gmail.com"
    recipient_list = [user_email]

    send_mail(subject, message, from_email, recipient_list)
