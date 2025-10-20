from django.contrib import admin
from .models import Project
from django.contrib import admin
from .models import Project

class TagsFilter(admin.SimpleListFilter):
    title = 'Tags'
    parameter_name = 'tag'

    def lookups(self, request, model_admin):

        all_tags = set()
        for project in Project.objects.all():
            if isinstance(project.tags, list):
                all_tags.update(project.tags)
            else:
                all_tags.add(project.tags)

        return [(tag, tag) for tag in sorted(all_tags)]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(tags__contains=[self.value()])
        return queryset


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'owner', 'status', 'health', 'progress',
        'tags_display', 'is_deleted', 'version', 'last_updated'
    )
    
    list_filter = ('status', 'health', 'owner', TagsFilter)
    
    search_fields = ('title', 'description', 'owner', 'tags_search')

    def tags_display(self, obj):
        if isinstance(obj.tags, list):
            return ", ".join(obj.tags)
        return obj.tags
    tags_display.short_description = 'Tags'

    def tags_search(self, obj):
        if isinstance(obj.tags, list):
            return " ".join(obj.tags)
        return obj.tags
