# Generated migration for Notification model
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('merchants', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('order', 'Order Update'), ('route', 'Route Update'), ('rider', 'Rider Update'), ('pod', 'Proof of Delivery'), ('system', 'System Alert'), ('payment', 'Payment Update'), ('alert', 'Alert')], default='system', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=10)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('related_object_type', models.CharField(blank=True, max_length=50, null=True)),
                ('related_object_id', models.IntegerField(blank=True, null=True)),
                ('is_read', models.BooleanField(default=False)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('merchant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='merchants.merchant')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['merchant', '-created_at'], name='notificatio_merchan_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['merchant', 'is_read'], name='notificatio_merchan_read_idx'),
        ),
    ]
