from django.db import models

class Project(models.Model):
    
    # Status Constants
    STATUS_ACTIVE = "active"
    STATUS_PAUSED = "paused"
    STATUS_COMPLETED = "completed"
    STATUS_PLANNING = "planning"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_PAUSED, "Paused"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_PLANNING, "Planning"),
    ]

    # Health Constants
    HEALTH_GOOD = "good"
    HEALTH_WARNING = "warning"
    HEALTH_CRITICAL = "critical"

    HEALTH_CHOICES = [
        (HEALTH_GOOD, "Good"),
        (HEALTH_WARNING, "Warning"),
        (HEALTH_CRITICAL, "Critical"),
    ]

    # Model Fields
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.CharField(max_length=255)
    tags = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    health = models.CharField(max_length=32, choices=HEALTH_CHOICES, default=HEALTH_GOOD)
    progress = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    version = models.IntegerField(default=1)

    class Meta:
        ordering = ['-last_updated']

    def soft_delete(self):
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'last_updated'])

    def restore(self):
        self.is_deleted = False
        self.save(update_fields=['is_deleted', 'last_updated'])

    def __str__(self):
        return self.title
