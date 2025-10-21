from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "owner",
            "tags",
            "status",
            "health",
            "progress",
            "last_updated",
            "is_deleted",
            "version",
        ]
        read_only_fields = ["id", "last_updated", "is_deleted", "version"]

    # Update method to increment version on each update
    def update(self, instance, validated_data):
        for k, v in validated_data.items():
            setattr(instance, k, v)
        
        instance.version = (instance.version or 0) + 1
        instance.save()
        return instance
