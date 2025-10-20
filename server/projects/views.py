from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound, ParseError
from django.utils.http import parse_etags

from .models import Project
from .serializers import ProjectSerializer
from .pagination import LimitOffsetPaginationWithCount

def _base_qs():
    return Project.objects.all()

def _status_choices():
    return [c[0] for c in Project._meta.get_field("status").choices]

def _health_choices():
    return [c[0] for c in Project._meta.get_field("health").choices]

# ---------------- Project ViewSet --------------------------------------
class ProjectViewSet(viewsets.ModelViewSet):
    """
    Implements:
     - GET /api/v1/projects  (list)
     - POST /api/v1/projects (create)
     - GET /api/v1/projects/{id} (retrieve)
     - PATCH /api/v1/projects/{id} (partial_update) with If-Match ETag
     - DELETE /api/v1/projects/{id} (soft delete)
     - POST /api/v1/projects/bulk-update (custom action)
    """
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    pagination_class = LimitOffsetPaginationWithCount

    # ---------------- list (with filters/search/sort) --------------------------
    def get_queryset(self):
        qs = _base_qs().all()
        params = self.request.query_params

        status_val = params.get('status')
        owner = params.get('owner')
        tags = params.get('tags')
        health = params.get('health')
        min_health = params.get('health_min')
        is_deleted_val = params.get('is_deleted')
        q = params.get('q') or params.get('search')

        if status_val:
            qs = qs.filter(status=status_val)
        if owner:
            qs = qs.filter(owner__icontains=owner)
        if health:
            qs = qs.filter(health=health)
        if tags:
            qs = qs.filter(tags__icontains=tags)
        if is_deleted_val:
            if is_deleted_val == 'true':
                qs = qs.filter(is_deleted=True)
            else:
                qs = qs.filter(is_deleted=False)
        if min_health:
            try:
                mh = float(min_health)
                qs = qs.filter(progress__gte=mh)
            except (TypeError, ValueError):
                pass

        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(tags__icontains=q)
            )

        ordering = params.get('ordering')
        if ordering:
            qs = qs.order_by(ordering)

        print("Ordering by:", qs)
        return qs
    
    # ---------------- create -------------------------------------------------
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance
        headers = self.get_success_headers(serializer.data)
        resp = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        resp['ETag'] = f'W/"{instance.version}"'
        return resp

    # ---------------- partial update (If-Match ETag) ------------------------
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        if_match = request.headers.get('If-Match')
        if if_match:
            provided = parse_etags(if_match)
            ok = False
            for token in provided:
                token_clean = token.replace('W/', '').strip().strip('"')
                try:
                    ver = int(token_clean)
                    if ver == instance.version:
                        ok = True
                        break
                except Exception:
                    continue
            if not ok:
                return Response({
                    'detail': 'ETag mismatch. Resource has been modified.',
                    'current_version': instance.version
                }, status=status.HTTP_409_CONFLICT)

        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance.refresh_from_db()
        resp = Response(serializer.data)
        resp['ETag'] = f'W/"{instance.version}"'
        return resp

    # ---------------- soft delete -------------------------------------------

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # ---------------- bulk update -------------------------------------------

    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """
        Payload:
        {
          "ids": [1,2,3],            # required
          "status": "paused",        # optional
          "owner": "Alex",           # optional
          "health": "warning",       # optional
          "tag": "maintenance"       # optional (single tag to add)
        }
        """
        ids = request.data.get('ids')
        if not ids or not isinstance(ids, (list, tuple)):
            raise ParseError(detail="`ids` must be a non-empty list of project IDs.")

        status_value = request.data.get('status')
        owner_value = request.data.get('owner')
        health_value = request.data.get('health')
        tag_value = request.data.get('tag')

        # validate choices if provided
        if status_value and status_value not in _status_choices():
            raise ParseError(detail=f"`status` must be one of {_status_choices()}")
        if health_value and health_value not in _health_choices():
            raise ParseError(detail=f"`health` must be one of {_health_choices()}")

        with transaction.atomic():
            qs = Project.objects.select_for_update().filter(id__in=ids, is_deleted=False)
            found_ids = list(qs.values_list('id', flat=True))
            if not found_ids:
                raise NotFound(detail="No matching projects found for provided ids.")

            updated_count = 0
            for proj in qs:
                changed = False
                if status_value:
                    proj.status = status_value
                    changed = True
                if owner_value:
                    proj.owner = owner_value
                    changed = True
                if health_value:
                    proj.health = health_value
                    changed = True
                if tag_value:
                    tags = proj.tags or []
                    if tag_value not in tags:
                        tags.append(tag_value)
                        proj.tags = tags
                        changed = True

                if changed:
                    proj.version = (proj.version or 0) + 1
                    proj.save()
                    updated_count += 1

        return Response({
            "updated_count": updated_count,
            "requested_ids": ids,
            "found_ids": found_ids
        }, status=status.HTTP_200_OK)

    # ---------------- filter endpoints (robust) ------------------------------

    @action(detail=False, methods=['get'], url_path='filters/owners')
    def filter_owners(self, _):
        owners = _base_qs().values_list('owner', flat=True)
        return Response(sorted({o for o in owners if o}))

    @action(detail=False, methods=['get'], url_path='filters/tags')
    def filter_tags(self, _):
        all_tags = _base_qs().values_list('tags', flat=True)
        tags_set = set()
        for t in all_tags:
            if isinstance(t, (list, tuple)):
                tags_set.update([str(x).strip() for x in t if str(x).strip()])
            elif isinstance(t, str):
                tags_set.update([s.strip() for s in t.split(',') if s.strip()])
        return Response(sorted(tags_set))

    @action(detail=False, methods=['get'], url_path='filters/status')
    def filter_status(self, _):
        return Response(_status_choices())

    @action(detail=False, methods=['get'], url_path='filters/health')
    def filter_health(self, _):
        return Response(_health_choices())
   
    @action(detail=False, methods=['get'], url_path='deleted')
    def list_deleted(self, _):
        qs = Project.objects.filter(is_deleted=True).order_by('-last_updated')
        page = self.paginate_queryset(qs)
        print("Deleted projects queryset:", self.request.query_params)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # Bulk recover deleted projects
    @action(detail=False, methods=['post'], url_path='bulk-recover')
    def bulk_recover(self, request):
        ids = request.data.get('ids')
        if not ids or not isinstance(ids, (list, tuple)):
            raise ParseError("`ids` must be a non-empty list of project IDs.")
        qs = Project.objects.filter(id__in=ids, is_deleted=True)
        found = list(qs.values_list('id', flat=True))
        if not found:
            return Response({"updated_count": 0, "requested_ids": ids, "found_ids": []})
        updated_count = 0
        for p in qs:
            p.restore()
            updated_count += 1
        return Response({
            "updated_count": updated_count,
            "requested_ids": ids,
            "found_ids": found
        }, status=status.HTTP_200_OK)

