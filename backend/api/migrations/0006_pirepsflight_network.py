# Generated by Django 5.1.6 on 2025-02-16 15:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_pirepsflight_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='pirepsflight',
            name='network',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
