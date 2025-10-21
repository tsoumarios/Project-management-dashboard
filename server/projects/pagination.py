from rest_framework import pagination
from rest_framework.response import Response

class LimitOffsetPaginationWithCount(pagination.LimitOffsetPagination):
    default_limit = 9
    max_limit = 200

    def get_paginated_response(self, data):
        return Response({
            'count': self.count,
            'limit': self.limit,
            'offset': self.offset,
            'results': data
        })
