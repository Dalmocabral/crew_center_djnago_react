# Generated by Django 5.1.6 on 2025-02-25 12:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_flightleg_leg_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='flightleg',
            name='leg_number',
            field=models.PositiveIntegerField(editable=False),
        ),
    ]
