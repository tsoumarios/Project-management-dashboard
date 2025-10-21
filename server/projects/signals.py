from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project
from .realtime import publish

@receiver(post_save, sender=Project)
def on_project_saved(sender, instance: Project, created, **kwargs):
    publish({
        "type": "project_created" if created else "project_updated",
        "project": {
            "id": instance.id,
            "title": instance.title,
            "owner": instance.owner,
            "status": instance.status,
            "health": instance.health,
            "progress": instance.progress,
            "last_updated": instance.last_updated.isoformat(),
            "is_deleted": instance.is_deleted,
        },
    })
