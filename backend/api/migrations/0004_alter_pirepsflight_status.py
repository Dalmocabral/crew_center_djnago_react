# Generated by Django 5.1.6 on 2025-02-15 22:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_award_allowedicao_allowedaircraft_flightleg_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pirepsflight',
            name='status',
            field=models.CharField(default='Em análise', max_length=20),
        ),
    ]
