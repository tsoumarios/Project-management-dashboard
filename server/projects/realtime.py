# projects/realtime.py
import json
import queue
import threading
from typing import Set

# Thread-safe subscriber registry
_subscribers: Set[queue.Queue] = set()
_lock = threading.Lock()

# Each subscriber gets a bounded, thread-safe queue
def subscribe() -> queue.Queue:
    q = queue.Queue(maxsize=1000)
    with _lock:
        _subscribers.add(q)
    return q

def unsubscribe(q: queue.Queue):
    with _lock:
        _subscribers.discard(q)

def publish(event: dict):
    """Publish to all subscribers. Drop slow ones."""
    data = json.dumps(event)
    with _lock:
        dead = []
        for q in list(_subscribers):
            try:
                q.put_nowait(data)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _subscribers.discard(q)
