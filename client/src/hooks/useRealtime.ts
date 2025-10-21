import { useEffect } from "react";

export const useRealtime = (onMessage: () => void) => {
  useEffect(() => {
    const source = new EventSource(
      import.meta.env.VITE_API_URL + "/v1/projects/stream"
    );
    source.onmessage = () => onMessage();
    source.onerror = () => source.close();
    return () => source.close();
  }, [onMessage]);
};
