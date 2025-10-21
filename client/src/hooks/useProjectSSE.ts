import { useEffect, useRef } from "react";
import { projectApi } from "../app/api/projectApi";

export function useProjectSSE(dispatch: any) {
  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef(1000); // ms

  useEffect(() => {
    let closed = false;

    const connect = () => {
      // goes through Vite proxy because of /api prefix
      const es = new EventSource("/api/v1/projects/stream/");
      esRef.current = es;

      es.onmessage = (ev) => {
        backoffRef.current = 1000; // reset backoff on any message
        try {
          const msg = JSON.parse(ev.data);
          if (
            msg.type === "project_updated" ||
            msg.type === "project_created"
          ) {
            const id = msg.project?.id;
            // invalidate single + list to refetch incrementally
            if (id != null) {
              dispatch(
                projectApi.util.invalidateTags([
                  { type: "Project", id },
                  { type: "Project", id: "LIST" },
                  { type: "Project", id: "DELETED_LIST" },
                ])
              );
            } else {
              dispatch(
                projectApi.util.invalidateTags([
                  { type: "Project", id: "LIST" },
                ])
              );
            }
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;

        if (!closed) {
          const ms = Math.min(backoffRef.current, 15000);
          setTimeout(connect, ms);
          backoffRef.current *= 2;
        }
      };
    };

    connect();
    return () => {
      closed = true;
      esRef.current?.close();
    };
  }, [dispatch]);
}
