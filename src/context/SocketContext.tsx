import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://localhost:3001");

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || socketRef.current?.connected) return;

    tokenRef.current = token;

    const s = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      console.log("[Socket] Connected");
      setIsConnected(true);
    });
    
    s.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      setIsConnected(false);
    });
    
    s.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err?.message || err);
    });
    
    s.on("error", (err: { message?: string }) => {
      console.warn("[Socket] Error:", err?.message || err);
    });

    socketRef.current = s;
    setSocket(s);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !socketRef.current) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
