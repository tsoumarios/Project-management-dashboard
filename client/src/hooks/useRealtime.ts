import { useEffect } from "react";

export const useRealtime = (onMessage: () => void) => {
  useEffect(() => {
    const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";
    const source = new EventSource(`${API_PREFIX}/v1/projects/stream`);
    source.onmessage = () => onMessage();
    source.onerror = () => source.close();
    return () => source.close();
  }, [onMessage]);
};
