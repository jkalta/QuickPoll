import { useEffect, useRef } from "react";

export function useWebSocket(url: string, onMessage?: (msg: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (ws.current) return; // prevents reconnecting every render

    const connect = () => {
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected:", url);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Received WS message (raw):", event.data);
          console.log("📬 Parsed WS message (JSON):", data);
          onMessage?.(data);
        } catch (err) {
          console.error("❌ Failed to parse WS message:", event.data, err);
        }
      };

      socket.onclose = () => {
        console.warn("⚠️ WS closed, retrying in 3s...");
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => ws.current?.close();
  }, [url, onMessage]);
}
