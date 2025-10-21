import json
import time
from django.http import StreamingHttpResponse
from django.views.decorators.http import require_GET
from django.utils.timezone import now
from .realtime import subscribe, unsubscribe

HEARTBEAT_SECS = 15

def _sse(data: str) -> bytes:
    # minimal SSE framing
    return f"data: {data}\n\n".encode("utf-8")

@require_GET
def project_stream(request):
    """
    SSE endpoint: /api/v1/projects/stream/
    - sync generator, safe with thread-based runserver
    - heartbeats every HEARTBEAT_SECS
    """
    q = subscribe()

    def gen():
        try:
            # initial hello
            yield _sse(json.dumps({"type": "hello", "ts": now().isoformat()}))
            last = time.time()
            while True:
                try:
                    # poll with timeout for heartbeat
                    item = q.get(timeout=1.0)
                    yield _sse(item)
                    last = time.time()
                except Exception:
                    # timeout -> maybe send heartbeat
                    if time.time() - last >= HEARTBEAT_SECS:
                        yield _sse(json.dumps({"type": "heartbeat"}))
                        last = time.time()
        finally:
            unsubscribe(q)

    resp = StreamingHttpResponse(gen(), content_type="text/event-stream")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"  # helpful if later behind nginx
    return resp
