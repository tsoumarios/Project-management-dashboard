from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from .views_csrf import csrf

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [path("csrf/", csrf)] + router.urls
